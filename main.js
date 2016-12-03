const profiler = require('screeps-profiler');
var roleUpgrader = require('role.upgrader');
profiler.registerObject(roleUpgrader, 'roleUpgrader');
var roleCivilian = require('role.civilian');
profiler.registerObject(roleCivilian, 'roleCivilian');
var roleHunter = require('role.hunter');
profiler.registerObject(roleHunter, 'roleHunter');
var roleMiner = require('role.miner');
profiler.registerObject(roleMiner, 'roleMiner');
var roleRunner = require('role.runner');
profiler.registerObject(roleRunner, 'roleRunner');
var roleReserver = require('role.reserver');
profiler.registerObject(roleReserver, 'roleReserver');
var roleRepairer = require('role.repairer');
profiler.registerObject(roleRepairer, 'roleRepairer');
var roleColonist = require('role.colonist');
profiler.registerObject(roleColonist, 'roleColonist');
var remoteHunter = require('remote.hunter');
profiler.registerObject(remoteHunter, 'remoteHunter');
var remoteMiner = require('remote.miner');
profiler.registerObject(remoteMiner, 'remoteMiner');
var remoteRunner = require('remote.runner');
profiler.registerObject(remoteRunner, 'remoteRunner');
var roleClaimer = require('role.claimer');
profiler.registerObject(roleClaimer, 'roleClaimer');
var roleRecycler = require('role.recycler');
profiler.registerObject(roleRecycler, 'roleRecycler');
var roleThief = require('role.thief');
profiler.registerObject(roleThief, 'roleThief');
var roleRaider = require('role.raider');
profiler.registerObject(roleRaider, 'roleRaider');
var roleRaidHealer = require('role.raidHealer');
profiler.registerObject(roleRaidHealer, 'roleRaidHealer');
var roleDismantler = require('role.dismantler');
profiler.registerObject(roleDismantler, 'roleDismantler');
var roleMineralMiner = require('role.mineralMiner');
profiler.registerObject(roleMineralMiner, 'roleMineralMiner');
var roleTerminalManager = require('role.terminalManager');
profiler.registerObject(roleTerminalManager, 'roleTerminalManager');
const roleLaborant = require('role.laborant');
profiler.registerObject(roleLaborant, 'roleLaborant');
var respawn = require('respawn');
profiler.registerObject(respawn, 'respawn');
var tasks = require('tasks');
profiler.registerObject(tasks, 'tasks');
var planOutheal = require('plan.outheal');
profiler.registerObject(planOutheal, 'planOutheal');
var planWaitstorm = require('plan.waitstorm');
profiler.registerObject(planWaitstorm, 'planWaitstorm');
var utils = require('utils');
profiler.registerObject(utils, 'utils');
const marketManager = require('marketManager');
profiler.registerObject(marketManager, 'marketManager');
const labManager = require('labManager');
profiler.registerObject(labManager, 'labManager');

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
			else if(creep.memory.role == 'laborant'){
				try{
					roleLaborant.run(creep);
				}
				catch(err){
					console.log("Error " + err + " in roleLaborant.run of creep " + creep.name);
				}
			}
			// var elapsed = Game.cpu.getUsed() - startCpu;
			// console.log('Creep '+name+' with role '+creep.memory.role+' has used '+elapsed+' CPU time');
		}
		respawn.run(myrooms);
		if(Game.time % 50 == 0){
    		marketManager.run();
		}

		if(Game.flags['blockade'] && Game.time % 1200 == 0){
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

		if(Game.time == 15754573){
			require("plan.outheal").start("healRally","healTarget");
		}
		if(Game.time > 15754573 && Game.time % 50 == 0 && Memory.planOutheal.stage == 0){
			if(Game.flags.healRally.pos.findInRange(FIND_MY_CREEPS,5).length >= 4){
				require("plan.outheal").trigger();
			}
		}
		if(Memory.planOutheal.stage == 1 && Game.time % 50 == 10){
			require("plan.outheal").trigger();
		}
		// var newRoom = Game.rooms['W55S18'];
		// var hostilesInNewRoom =  newRoom.find(FIND_HOSTILE_CREEPS,{filter: (c) => !_.contains(playerWhiteList,c.owner.username)});
		// if(hostilesInNewRoom.length > 0){
		// 	newRoom.controller.activateSafeMode();
		// }
	});
}
