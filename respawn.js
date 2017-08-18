"use strict";

const tasks = require("tasks");

var cost = function(body){
	var mycost = 0;
	for(var bodypart of body){
		mycost += BODYPART_COST[bodypart]
	}
	return mycost
}


var bodies = {
	miner : function(maxEnergy){
		var body=[WORK];
		var minEnergy = cost([WORK,MOVE])
		if(maxEnergy > minEnergy){
			var n = Math.min(Math.floor((maxEnergy - minEnergy)/BODYPART_COST[WORK]),4); //a maximum of 5 WORK parts
			for(var i=0; i<n; i++){
				body.push(WORK);
			}
		}
		body.push(MOVE);
		return body
	},

	runner : function(maxEnergy){
		var template = [CARRY,MOVE];
		var intervalEnergy=cost(template);
		var n = Math.min(Math.floor(maxEnergy/intervalEnergy),10); //currently hardcapped at 10
		var body = [];
		for(var i=0;i<n;i++){
			body.push(CARRY,MOVE);
		}
		return body
	},

	civilian : function(maxEnergy){
		var template = [WORK,CARRY,MOVE];
		var intervalEnergy = cost(template);
		var n = Math.min(Math.floor(maxEnergy/intervalEnergy),10); //hardcapped at 10
		var body = [];
		for(var i=0;i<n;i++){
			body.push(WORK,CARRY,MOVE);
		}
		return body
	},

	hunter : function(maxEnergy){
		var toughTemplate = [TOUGH,MOVE];
		var toughCost = cost(toughTemplate);
		var attackTemplate = [ATTACK,MOVE];
		var attackCost = cost(attackTemplate);
		var toughNo = Math.min(Math.floor(maxEnergy/12/toughCost),6); //at most 1/12 of energy should go towards TOUGH parts
		var energyLeft = maxEnergy - toughNo * toughCost;
		var attackNo = Math.min(Math.floor(energyLeft/attackCost),19); //no more than 50 body parts
		var body = [];
		for(var i=0;i<toughNo;i++){
			body.push(TOUGH);
		}
		for(i=0;i<toughNo;i++){
			body.push(MOVE);
		}
		for(i=0;i<attackNo;i++){
			body.push(...attackTemplate);
		}
		return body
	},

	reserver : function(maxEnergy){
		return [MOVE,CLAIM,CLAIM,MOVE];
	},

	remoteMiner : function(maxEnergy){
		return [WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE]
	},

	remoteRunner : function(maxEnergy){
		var template = [CARRY,CARRY,MOVE];
		var intervalEnergy=cost(template);
		var n = Math.min(Math.floor((maxEnergy-200)/intervalEnergy),10); //currently hardcapped at 1050 carry
		var body = [];
		for(var i=0;i<n;i++){
			body.push(CARRY,CARRY,MOVE);
		}
		body.push(CARRY,WORK,MOVE);
		return body
	},

	remoteRunnerByCarry : function(numCarry){
		var template = [CARRY,CARRY,MOVE];
		var n = Math.floor(numCarry/2);
		var body = [];
		for(var i=0;i<n;i++){
			body.push(CARRY,CARRY,MOVE);
		}
		body.push(CARRY,WORK,MOVE);
		return body;
	},

	colonist : function(maxEnergy){
		var template = [WORK,CARRY,MOVE,MOVE];
		var intervalEnergy = cost(template);
		var n = Math.min(Math.floor(maxEnergy/intervalEnergy),8);
		var body = [];
		for(var i=0;i<n;i++){
			body.push(...template);
		}
		return body
	},

	mineralMiner : function(maxEnergy){
		var template = [WORK,WORK,MOVE];
		var intervalEnergy = cost(template);
		var n = Math.min(Math.floor(maxEnergy/intervalEnergy),16); //do not exceed 50 bodyparts
		var body = [];
		for(var i=0;i<n;i++){
			body.push(...template);
		}
		return body
	}
}

module.exports = {
	run : function(room){
		var spawn = room.find(FIND_STRUCTURES,{filter : (s) => s.structureType == STRUCTURE_SPAWN && s.spawning == null})[0];
		if(spawn==undefined){
			return;
		}
		var maxEnergy = room.energyCapacityAvailable;
		let storage = room.storage;

		var miner_target = room.find(FIND_SOURCES).length;
		var runner_target = 2;
		var civilian_target = 6;
		if(room.controller.level > 3){
			civilian_target = Math.max(Math.min(Math.ceil(30/(bodies.civilian(maxEnergy).length/3)),7),2) + ( room.storage != undefined ? Math.floor(room.storage.store.energy/200000) : 0 );
		}
		var hunter_target = 0;
		if(room.memory.underAttack){
			var hostiles = room.find(FIND_HOSTILE_CREEPS,{filter: (c) => !_.contains(playerWhiteList,c.owner.username) }).length;
			hunter_target=Math.ceil(hostiles/2);
		}
		var terminalManager_target = 0;
		if(room.controller.level >= 6){
			//runner_target = 1;
			terminalManager_target = 1;
		}
		var mineral = room.find(FIND_MINERALS)[0];

		var creepsByRole = _.groupBy(_.filter(Game.creeps,(c) => c.pos.roomName == room.name),'memory.role'); //this also counts spawning creeps
		var miners = creepsByRole.miner != undefined ? creepsByRole.miner.length : 0;
		var runners = creepsByRole.runner != undefined ? creepsByRole.runner.length : 0;
		var civilians = creepsByRole.civilian != undefined ? creepsByRole.civilian.length : 0;
		var hunters = creepsByRole.hunter != undefined ? creepsByRole.hunter.length : 0;
		var mineralMiners = creepsByRole.mineralMiner != undefined ? creepsByRole.mineralMiner.length : 0;
		var terminalManagers = creepsByRole.terminalManager != undefined ? creepsByRole.terminalManager.length : 0;

		if(room.memory.requestList === undefined){ //checking this every tick is a waste
			room.memory.requestList = [];
		}
		var requestList = room.memory.requestList;

		//first ensure that at least one miner, one runner and one upgrader is always active
		if(miners < 1){
			spawn.createCreep(bodies.miner(room.energyAvailable),undefined,{role:ROLE_MINER});
		}
		else if(runners < 1){
			spawn.createCreep(bodies.runner(room.energyAvailable),undefined,{role:ROLE_RUNNER});
		}
		else if(civilians < 1 && room.controller.ticksToDowngrade < 500){
			spawn.createCreep(bodies.civilian(room.energyAvailable),undefined,{role:ROLE_CIVILIAN});
		}
		//after essentials are ensured, work on the requestList
		else if(requestList.length > 0){
			if(spawn.canCreateCreep(...requestList[0]) == OK){
				spawn.createCreep(...requestList.shift()) //spawns the first creep in the list and deletes it from the list
				room.memory.requestList = requestList;
			}
		}
		else if(miners < miner_target){
			spawn.createCreep(bodies.miner(maxEnergy),undefined,{role:ROLE_MINER});
		}
		else if(runners < runner_target){
			spawn.createCreep(bodies.runner(maxEnergy),undefined,{role:ROLE_RUNNER});
		}
		else if(hunters < hunter_target){
			spawn.createCreep(bodies.hunter(maxEnergy),undefined,{role:ROLE_HUNTER});
		}
		else if(civilians < civilian_target) {
			spawn.createCreep(bodies.civilian(maxEnergy),undefined,{role:ROLE_CIVILIAN});
		}
		else if(room.controller.level >= 6 && room.find(FIND_STRUCTURES,{filter:(s) => s.structureType == STRUCTURE_EXTRACTOR}).length > 0 && mineral.ticksToRegeneration === undefined && mineralMiners < 1){
			spawn.createCreep(bodies.mineralMiner(maxEnergy),undefined,{role:ROLE_MINERAL_MINER});
		}
		else if(terminalManagers < terminalManager_target){
			spawn.createCreep(bodies.runner(maxEnergy),undefined,{role:ROLE_TERMINAL_MANAGER});
		}
		else{
			//spawn colonists
			if(!room.memory.colonies){
				room.memory.colonies = [];
			}
			for(var colony of room.memory.colonies){
				var colonists = _.filter(Game.creeps,(c) => c.role == ROLE_COLONIST && c.memory.myColony == colony);
				if(colonists.length < 1){
					spawn.createCreep(bodies.colonist(maxEnergy),undefined,{role:ROLE_COLONIST, myColony : colony});
					return;
				}
			}
			//do spawning for remoteRooms
			if(!room.memory.remoteRooms){
				room.memory.remoteRooms = [];
			}
			for(var remoteRoomName of room.memory.remoteRooms){
				var remoteCreepsByRole = _.groupBy(_.filter(Game.creeps,(c) => c.task && c.task.roomName == remoteRoomName), "memory.role");
				if(Memory.rooms[remoteRoomName].underAttack){
					var remoteHunters = remoteCreepsByRole.hunter != undefined ? remoteCreepsByRole.hunter.length : 0;
					if(hunters < 2){
						spawn.createCreep(bodies.hunter(maxEnergy/2),undefined,{role:ROLE_HUNTER});
						return;
					}
				}
				var reservers = remoteCreepsByRole.reserver != undefined ? remoteCreepsByRole.reserver.length : 0;
				if(reservers < 1){
					//var reservetask = Memory.rooms[remoteRoomName].controller;
					var reservetask = _.get(Memory, "rooms." + remoteRoomName + ".controller", null)
					if(reservetask != null){ //this might be null if the remoteRoom is initialized but not scouted yet
						var controllerId = reservetask.id;
						var controller = Game.getObjectById(controllerId);
						if(controller == null || !controller.reservation || controller.reservation.ticksToEnd < 500){
							spawn.createCreep(bodies.reserver(maxEnergy),undefined,{role:ROLE_RESERVER, task : reservetask});
							return;
						}
					}
				}
				var remoteMiners = remoteCreepsByRole.remoteMiner;
				var remoteRunners = _.filter(Game.creeps,(c) => c.role == ROLE_REMOTE_RUNNER && c.memory.assocTask && c.memory.assocTask.roomName == remoteRoomName);
				for (var remoteminetask of _.get(Memory, "rooms." + remoteRoomName + ".sources", {})){
					var taskRemoteMiners = _.filter(remoteMiners, (c) => c.task.id == remoteminetask.id && (c.ticksToLive > c.memory.travelTime + 30 || c.spawning) );
					var numRemoteMiners = taskRemoteMiners != undefined ? taskRemoteMiners.length : 0;
					if(numRemoteMiners < 1){
						spawn.createCreep(bodies.remoteMiner(maxEnergy), undefined, {role:ROLE_REMOTE_MINER, task : remoteminetask, travelTime : 0});
						return;
					}
					var taskRemoteRunners = _.filter(remoteRunners, (c) => c.memory.assocTask.id == remoteminetask.id);
					var numRemoteCarry = _.sum(taskRemoteRunners, (c) => c.getActiveBodyparts(CARRY));
					var roomCarry = _.countBy(bodies.remoteRunner(maxEnergy), _.identity)[CARRY];
					var targetCarry = remoteminetask.carryNeeded || roomCarry;
					if(numRemoteCarry < targetCarry){
						var carryPerCreep;
						if(targetCarry > roomCarry){
							var numCreeps = Math.ceil(targetCarry/roomCarry);
							carryPerCreep = Math.ceil(targetCarry/numCreeps);
						}
						else{
							carryPerCreep = targetCarry;
						}
						spawn.createCreep(bodies.remoteRunnerByCarry(carryPerCreep),undefined,{role: ROLE_REMOTE_RUNNER, assocTask : remoteminetask});
					}


					// var numRemoteRunners = taskRemoteRunners != undefined ? taskRemoteRunners.length : 0;
					// var remoteRunner_target = 1;
					// if(remoteminetask.roomName in Game.rooms){
					// 	var mySource = tasks.getTarget(remoteminetask);
					// 	var myContainer = mySource.pos.findInRange(FIND_STRUCTURES,1,{filter: (s) => s.structureType == STRUCTURE_CONTAINER})[0];
					// 	var myDropped = mySource.pos.findInRange(FIND_DROPPED_RESOURCES,1,{filter: (r) => r.resourceType == RESOURCE_ENERGY})[0];
					// 	var myEnergy = ( myContainer != undefined ? myContainer.store.energy : 0 ) + ( myDropped != undefined ? myDropped.amount : 0 );
					// 	if(myContainer == undefined){
					// 		remoteRunner_target = 0;
					// 	}
					// 	else{
					// 		remoteRunner_target = 1 + Math.floor(myEnergy/2000);
					// 	}
					// }
					// if(numRemoteRunners < remoteRunner_target){
					// 	spawn.createCreep(bodies.remoteRunner(maxEnergy),undefined,{role: ROLE_REMOTE_RUNNER, assocTask : remoteminetask});
					// 	return;
					// }
				}


				//add more remoteRoomLogic
			}
		}
	}
}
