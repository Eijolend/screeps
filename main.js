var roleUpgrader = require('role.upgrader');
var roleCivilian = require('role.civilian');
var roleHunter = require('role.hunter');
var roleMiner = require('role.miner');
var roleRunner = require('role.runner');
var roleReserver = require('role.reserver');
var roleRepairer = require('role.repairer');
var remoteUpgrader = require('remote.upgrader');
var remoteHunter = require('remote.hunter');
var remoteMiner = require('remote.miner');
var remoteRunner = require('remote.runner')
var roleClaimer = require('role.claimer');
var roleRecycler = require('role.recycler');
var roleThief = require('role.thief');
var roleRaider = require('role.raider');
var roleRaidHealer = require('role.raidHealer');
var roleDismantler = require('role.dismantler');
var respawn = require('respawn');
var tasks = require('tasks');
var planOutheal = require('plan.outheal');
const profiler = require('screeps-profiler');

global.playerWhiteList = ['PiratenBraut','PhillipK']

Room.prototype.requestCreep = function(body,name,mem){
	if(this.memory.requestList === undefined){
		this.memory.requestList = JSON.stringify([]);
	}
	var mylist = JSON.parse(this.memory.requestList);
	mylist.push([body,name,mem]);
	this.memory.requestList = JSON.stringify(mylist);
}


profiler.enable();
module.exports.loop = function(){
	profiler.wrap(function() {
		for(var i in Memory.creeps) {
			if(!Game.creeps[i]) {
				delete Memory.creeps[i];
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
			else if(creep.memory.role == 'remoteUpgrader'){
				remoteUpgrader.run(creep);
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
			else if(creep.memory.role == 'dismantler'){
				roleDismantler.run(creep);
			}
		}
		if('Raid' in Game.flags){
			if(Game.time % 1000 == 0){
				var raiderBody = [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE];
				var healerBody = [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,MOVE];
				Game.spawns.Spawn1.room.requestCreep(raiderBody,undefined,{role: 'raider', myflag:'defense1',waypoint:'waypoint'} );
				Game.spawns.Spawn1.room.requestCreep(raiderBody,undefined,{role: 'raider', myflag:'defense1',waypoint:'waypoint'} );
				Game.spawns.Spawn1.room.requestCreep(raiderBody,undefined,{role: 'raider', myflag:'defense1',waypoint:'waypoint'} );
				Game.spawns.Spawn2.room.requestCreep(healerBody,undefined,{role: 'raidHealer', myflag:'defense1',waypoint:'waypoint'});
				Game.spawns.Spawn3.room.requestCreep(healerBody,undefined,{role: 'raidHealer', myflag:'defense1',waypoint:'waypoint'});
				//===================//
				// Game.spawns.Spawn1.room.requestCreep(raiderBody,undefined,{role: 'raider', myflag:'defense2'} );
				// Game.spawns.Spawn1.room.requestCreep(raiderBody,undefined,{role: 'raider', myflag:'defense2'} );
				// Game.spawns.Spawn1.room.requestCreep(raiderBody,undefined,{role: 'raider', myflag:'defense2'} );
				// Game.spawns.Spawn1.room.requestCreep(healerBody,undefined,{role: 'raidHealer', myflag:'defense2'});
				// Game.spawns.Spawn1.room.requestCreep(healerBody,undefined,{role: 'raidHealer', myflag:'defense2'});
			}
		}
		respawn.run(myrooms);
	});
}
