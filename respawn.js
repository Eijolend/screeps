"use strict";

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
			civilian_target = Math.max(Math.min(Math.ceil(20/(bodies.civilian(maxEnergy).length/3))-1,7),2) + ( room.storage != undefined ? Math.floor(room.storage.store.energy/200000) : 0 );
		}
		var hunter_target = 0;
		if(room.memory.underAttack){
			var hostiles = room.find(FIND_HOSTILE_CREEPS,{filter: (c) => !_.contains(playerWhiteList,c.owner.username) }).length;
			hunter_target=Math.ceil(hostiles/2);
		}

		var creepsByRole = _.groupBy(_.filter(Game.creeps,(c) => c.pos.roomName == room.name),'memory.role'); //this also counts spawning creeps
		var miners = creepsByRole.miner != undefined ? creepsByRole.miner.length : 0;
		var runners = creepsByRole.runner != undefined ? creepsByRole.runner.length : 0;
		var civilians = creepsByRole.civilian != undefined ? creepsByRole.civilian.length : 0;
		var hunters = creepsByRole.hunter != undefined ? creepsByRole.hunter.length : 0;

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
		else if(hunters < hunter_target){
			spawn.createCreep(bodies.hunter(maxEnergy),undefined,{role:ROLE_HUNTER});
		}
		else if(miners < miner_target){
			spawn.createCreep(bodies.miner(maxEnergy),undefined,{role:ROLE_MINER});
		}
		else if(runners < runner_target){
			spawn.createCreep(bodies.runner(maxEnergy),undefined,{role:ROLE_RUNNER});
		}
		else if(civilians < civilian_target) {
			spawn.createCreep(bodies.civilian(maxEnergy),undefined,{role:ROLE_CIVILIAN});
		}
	}
}
