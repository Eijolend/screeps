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
			for(i=0; i<n; i++){
				body.push(WORK);
			}
		}
		body.push(MOVE);
		return body
	},
	civilian : function(maxEnergy){
		var template = [WORK,CARRY,MOVE];
		var intervalEnergy = cost(template);
		var n = Math.min(Math.floor(maxEnergy/intervalEnergy),10); //hardcapped at 10
		var body = [];
		for(i=0;i<n;i++){
			body.push(WORK,CARRY,MOVE);
		}
		return body
	},
	repairer : function(maxEnergy){
		return this.civilian(maxEnergy);
	},
	remoteMiner : function(maxEnergy){
		return [WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE]
	},
	remoteRunner : function(maxEnergy){
		var template = [CARRY,MOVE];
		var intervalEnergy=cost(template);
		var n = Math.min(Math.floor((maxEnergy-150)/intervalEnergy),16); //currently hardcapped at 800 carry
		var body = [];
		for(i=0;i<n;i++){
			body.push(CARRY,MOVE);
		}
		body.push(WORK,MOVE);
		return body
	},
	// harvester : function(maxEnergy){
	// 	var template = [WORK,CARRY,MOVE];
	// 	var intervalEnergy = cost(template);
	// 	var n = Math.min(Math.floor(maxEnergy/intervalEnergy),10); //hardcapped at 10
	// 	var body = [];
	// 	for(i=0;i<n;i++){
	// 		body.push(WORK,CARRY,MOVE);
	// 	}
	// 	return body
	// },
	runner : function(maxEnergy){
		var template = [CARRY,MOVE];
		var intervalEnergy=cost(template);
		var n = Math.min(Math.floor(maxEnergy/intervalEnergy),10); //currently hardcapped at 10
		var body = [];
		for(i=0;i<n;i++){
			body.push(CARRY,MOVE);
		}
		return body
	},
	mineralMiner : function(maxEnergy){
		var template = [WORK,WORK,MOVE];
		var intervalEnergy = cost(template);
		var n = Math.min(Math.floor(maxEnergy/intervalEnergy),16); //do not exceed 50 bodyparts
		var body = [];
		for(i=0;i<n;i++){
			body.push(WORK,WORK,MOVE);
		}
		return body
	},
	colonist : function(maxEnergy){
		var template = [WORK,CARRY,MOVE,MOVE];
		var intervalEnergy = cost(template);
		var n = Math.min(Math.floor(maxEnergy/intervalEnergy),8);
		var body = [];
		for(i=0;i<n;i++){
			body.push(...template);
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
		for(i=0;i<toughNo;i++){
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
    run : function(room) {
		var spawn = room.find(FIND_STRUCTURES,{filter : (s) => s.structureType == STRUCTURE_SPAWN && s.spawning == null})[0];
		if(spawn==undefined){
			return;
		}
		var maxEnergy = room.energyCapacityAvailable;

		// number of civilians: at least 1, maximally 3, else enough to upgrade ca. 500 per 50 ticks, +1 for every 200k in storage
		let storage = room.find(FIND_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_STORAGE})[0];
		var civilian_target = Math.max(Math.min(Math.ceil(20/(bodies.civilian(maxEnergy).length/3))-1,7),2) + ( storage != undefined ? Math.floor(storage.store.energy/200000) : 0 );
		// var emergencies = room.find(FIND_FLAGS,{filter: (f) => /emergency/.test(f.name)}).length
		// if(emergencies > 0 && storage.store.energy > 100000){ //make sure things get used quickly in an emergency
		// 	civilian_target += 2;
		// }
		var repairer_target = 1; //repairer is a builder that prioritises repairing non-wall structures
		var miner_target = room.memory.tasks[TASK_MINE].length;
		var runner_target = 2;
		var terminalManager_target = 0;
		if(room.controller.level >= 6){
			//runner_target = 1;
			terminalManager_target = 1;
		}
		var thief_target = 0;
		var hunter_target = 0;

		var hostiles = room.find(FIND_HOSTILE_CREEPS,{filter: (c) => !_.contains(playerWhiteList,c.owner.username) }).length;
		if(hostiles > 0){
			hunter_target=Math.ceil(hostiles/2);
		}

		var creepsByRole = _.groupBy(_.filter(Game.creeps,(c) => c.pos.roomName == room.name),'memory.role'); //this also counts spawning creeps
		var civilians = creepsByRole.civilian != undefined ? creepsByRole.civilian.length : 0;
		var repairers = creepsByRole.repairer != undefined ? creepsByRole.repairer.length : 0;
		var miners = creepsByRole.miner != undefined ? creepsByRole.miner.length : 0;
		var runners = creepsByRole.runner != undefined ? creepsByRole.runner.length : 0;
		var hunters = creepsByRole.hunter != undefined ? creepsByRole.hunter.length : 0;
		var mineralMiners = creepsByRole.mineralMiner != undefined ? creepsByRole.mineralMiner.length : 0;
		var terminalManagers = creepsByRole.terminalManager != undefined ? creepsByRole.terminalManager.length : 0;
		if(room.memory.requestList === undefined){ //checking this every tick is a waste
			room.memory.requestList = [];
		}
		var requestList = room.memory.requestList;
		var mineral = room.find(FIND_MINERALS)[0];
		// var upgraders = room.find(FIND_MY_CREEPS,{filter: (creep) => creep.memory.role == 'upgrader'});
		// var builders = room.find(FIND_MY_CREEPS,{filter: (creep) => creep.memory.role == 'builder'});
		// var repairers = room.find(FIND_MY_CREEPS,{filter: (creep) => creep.memory.role == 'repairer'});
		// var miners = room.find(FIND_MY_CREEPS,{filter: (creep) => creep.memory.role == 'miner'});
		// var runners = room.find(FIND_MY_CREEPS,{filter: (creep) => creep.memory.role == 'runner'});
		// var hunters = room.find(FIND_MY_CREEPS,{filter: (creep) => creep.memory.role == 'hunter'});
		// var thiefs = room.find(FIND_MY_CREEPS,{filter: (creep) => creep.memory.role == 'thief'});
       // console.log(miners.length + ' ' + runners.length + ' ' + upgraders.length + ' ' + repairers.length)

		//first ensure 1 miner, 1 runner, 1 upgrader are always available
		if(miners < 1){
			spawn.createCreep(bodies.miner(room.energyAvailable),undefined,{role:'miner'});
		}
		else if(runners < 1){
			spawn.createCreep(bodies.runner(room.energyAvailable),undefined,{role:'runner'});
		}
		else if(civilians < 1 && room.controller.ticksToDowngrade < 500){
			spawn.createCreep(bodies.civilian(room.energyAvailable),undefined,{role:'upgrader'});
		}
		// //prioritize first repairer so we have something to build early on
		// else if(repairers.length < 1){
			// spawn.createCreep(bodies.repairer(room.energyAvailable),undefined,{role:'repairer'});
		// }
		//after essentials are ensured, work on the requestList
		else if(requestList.length > 0){
			if(spawn.canCreateCreep(...requestList[0]) == OK){
				spawn.createCreep(...requestList.shift()) //spawns the first creep in the list and deletes it from the list
				room.memory.requestList = requestList;
			}
		}
		//now proceed with the rest in priority order
		else if(miners < miner_target){
			spawn.createCreep(bodies.miner(maxEnergy),undefined,{role:'miner'});
		}
		else if(runners < runner_target){
			spawn.createCreep(bodies.runner(maxEnergy),undefined,{role:'runner'});
		}
		else if(civilians < civilian_target) {
			spawn.createCreep(bodies.civilian(maxEnergy),undefined,{role:'civilian'});
		}
		else if(repairers < repairer_target) {
			spawn.createCreep(bodies.repairer(maxEnergy),undefined,{role: 'repairer'});
		}
		else if(hunters < hunter_target) {
			spawn.createCreep(bodies.hunter(maxEnergy/2),undefined,{role: 'hunter'});
		}
		else if(terminalManagers < terminalManager_target){
			spawn.createCreep(bodies.runner(maxEnergy),undefined,{role:'terminalManager'});
		}
		else if(room.controller.level >= 6 && room.find(FIND_STRUCTURES,{filter:(s) => s.structureType == STRUCTURE_EXTRACTOR}).length > 0 && mineral.ticksToRegeneration === undefined && mineralMiners < 1){
			spawn.createCreep(bodies.mineralMiner(maxEnergy),undefined,{role:'mineralMiner'});
		}
    }
};

module.exports.bodies = bodies;
