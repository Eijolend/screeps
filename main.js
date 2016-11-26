var roleUpgrader = require('role.upgrader');
var roleCivilian = require('role.civilian');
var roleHunter = require('role.hunter');
var roleMiner = require('role.miner');
var roleRunner = require('role.runner');
var roleReserver = require('role.reserver');
var roleRepairer = require('role.repairer');
var roleColonist = require('role.colonist');
var remoteHunter = require('remote.hunter');
var remoteMiner = require('remote.miner');
var remoteRunner = require('remote.runner');
var roleClaimer = require('role.claimer');
var roleRecycler = require('role.recycler');
var roleThief = require('role.thief');
var roleRaider = require('role.raider');
var roleRaidHealer = require('role.raidHealer');
var roleDismantler = require('role.dismantler');
var roleMineralMiner = require('role.mineralMiner');
var roleTerminalManager = require('role.terminalManager');
var respawn = require('respawn');
var tasks = require('tasks');
var planOutheal = require('plan.outheal');
var planWaitstorm = require('plan.waitstorm');
var utils = require('utils');
const marketManager = require('marketManager');
const profiler = require('screeps-profiler');

global.playerWhiteList = ['PiratenBraut','PhillipK','CokeJunkie','KaZoiden','WASP103'];

require('prototyping')();


profiler.enable();
module.exports.loop = function(){
	profiler.wrap(function() {
		if(Game.time % 500 == 0){ // garbage collect
			for(var i in Memory.creeps) {
				if(!Game.creeps[i]) {
					delete Memory.creeps[i];
				}
			}
			for(var i in Memory.flags) {
				if(!Game.flags[i]) {
					delete Memory.flags[i];
				}
			}
		}

		var myrooms = _.filter(Game.rooms, (r) => r.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN}).length > 0 );
		for(var room of myrooms){
			var towers = room.find(FIND_STRUCTURES, {filter: (structure) => structure.structureType == STRUCTURE_TOWER});
			if(towers.length){
				for(i=0;i<towers.length;i++){
					var tower = towers[i];
					tower.attack(tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS,{filter: (c) => !_.contains(playerWhiteList,c.owner.username)}));
					if(tower.energy > 800){
						tower.repair(tower.pos.findClosestByRange(FIND_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_RAMPART && s.hits < 5000}));
						// tower.repair(tower.pos.findClosestByRange(FIND_STRUCTURES, {filter : (structure) => (
							// structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART && structure.hits < structure.hitsMax) || (
							// (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART) && structure.hits < 5000)
						   // })
						// );
					}
				}
			}
		}

		for(var name in Game.creeps){
			// var startCpu = Game.cpu.getUsed();
			var creep = Game.creeps[name];
			if(creep.memory.role == 'runner'){
				roleRunner.run(creep);
			}
			else if(creep.memory.role == 'miner'){
				roleMiner.run(creep);
			}
			else if(creep.memory.role == 'upgrader'){
				roleUpgrader.run(creep);
			}
			else if(creep.memory.role == 'civilian'){
				roleCivilian.run(creep);
			}
			else if(creep.memory.role == 'repairer'){
				roleRepairer.run(creep);
			}
			else if(creep.memory.role == 'hunter'){
				roleHunter.run(creep);
			}
			else if(creep.memory.role == 'remoteMiner'){
				remoteMiner.run(creep);
			}
			else if(creep.memory.role == 'remoteRunner'){
				remoteRunner.run(creep);
			}
			else if(creep.memory.role == 'reserver'){
				roleReserver.run(creep);
			}
			else if(creep.memory.role == 'remoteHunter'){
				remoteHunter.run(creep);
			}
			else if(creep.memory.role == 'shield'){
	            creep.moveTo(Game.flags['Rally']);
			}
			else if(creep.memory.role == 'raider'){
				roleRaider.run(creep);
			}
			else if(creep.memory.role == 'raidHealer'){
				roleRaidHealer.run(creep);
			}
			else if(creep.memory.role == 'thief'){
				roleThief.run(creep);
			}
			else if(creep.memory.role == 'colonist'){
				roleColonist.run(creep);
			}
			else if(creep.memory.role == 'claimer'){
				roleClaimer.run(creep);
			}
			else if(creep.memory.role == 'recycler'){
				roleRecycler.run(creep);
			}
			else if(creep.memory.role == 'planOutheal'){
				planOutheal.run(creep);
			}
			else if(creep.memory.role == 'planWaitstorm'){
				planWaitstorm.run(creep);
			}
			else if(creep.memory.role == 'dismantler'){
				roleDismantler.run(creep);
			}
			else if(creep.memory.role == 'mineralMiner'){
				roleMineralMiner.run(creep);
			}
			else if(creep.memory.role == 'terminalManager'){
				roleTerminalManager.run(creep);
			}
			// var elapsed = Game.cpu.getUsed() - startCpu;
			// console.log('Creep '+name+' with role '+creep.memory.role+' has used '+elapsed+' CPU time');
		}
		respawn.run(myrooms);
		if(Game.time % 50 == 0){
    		marketManager.run();
		}

		if(Game.flags['blockade'] && Game.time % 1200){
			var blockadeBody = [TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE];
			Game.spawns.Spawn1.room.requestCreep(blockadeBody,undefined,{role:'raider',myflag:'blockade',waypoint:['waypoint']});
			Game.spawns.Spawn2.room.requestCreep(blockadeBody,undefined,{role:'raider',myflag:'blockade',waypoint:['waypoint']});
			Game.spawns.Spawn2.room.requestCreep(blockadeBody,undefined,{role:'raider',myflag:'blockade',waypoint:['waypoint']});

			var healBody = [TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,MOVE];
			Game.spawns.Spawn1.room.requestCreep(healBody,undefined,{role:'raidHealer',myflag:'blockade',waypoint:['waypoint']});
			Game.spawns.Spawn2.room.requestCreep(healBody,undefined,{role:'raidHealer',myflag:'blockade',waypoint:['waypoint']});
		}

		var startRoom = Game.rooms['W63N66'];
		if(Game.spawns.Spawn1.hits < Game.spawns.Spawn1.hitsMax){
			startRoom.controller.activateSafeMode();
		}
		// var newRoom = Game.rooms['W55S18'];
		// var hostilesInNewRoom =  newRoom.find(FIND_HOSTILE_CREEPS,{filter: (c) => !_.contains(playerWhiteList,c.owner.username)});
		// if(hostilesInNewRoom.length > 0){
		// 	newRoom.controller.activateSafeMode();
		// }
	});
}
