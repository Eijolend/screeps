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
var respawn = require('respawn');
var tasks = require('tasks');
var planOutheal = require('plan.outheal');
const profiler = require('screeps-profiler');

global.playerWhiteList = ['PiratenBraut']

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
					tower.attack(tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS,{filter: (c) => !(c.owner.username in playerWhiteList )}));
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
				if(creep.room.name==Game.flags['Raid'].pos.roomName){
					targets=Game.flags['Raid'].pos.findInRange(FIND_HOSTILE_STRUCTURES,0,{filter:(s) => s.structureType != STRUCTURE_ROAD && s.structureType != STRUCTURE_CONTROLLER});
					if (targets.length){
						target=targets[0]
					}
					else{
						target=Game.flags['Raid'].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
					}
					// if(target==null){
					// 	target=Game.flags['Raid'].pos.findClosestByRange(FIND_HOSTILE_STRUCTURES,{filter:(s) => s.structureType != STRUCTURE_ROAD && s.structureType != STRUCTURE_CONTROLLER});
					// }
					if(creep.attack(target) == ERR_NOT_IN_RANGE){
						creep.moveTo(target);
					}
				}
				else{
					creep.moveTo(Game.flags['Raid']);
				}
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
		}

		respawn.run(myrooms);
	});
}
