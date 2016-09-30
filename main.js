var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');
var roleHunter = require('role.hunter');
var roleMiner = require('role.miner');
var roleRunner = require('role.runner');
var roleReserver = require('role.reserver');
var roleRepairer = require('role.repairer');
var remoteUpgrader = require('remote.upgrader');
var roleClaimer = require('role.claimer');
var respawn = require('respawn');
var tasks = require('tasks');

module.exports.loop = function(){

    for(var i in Memory.creeps) {
		if(!Game.creeps[i]) {
			delete Memory.creeps[i];
		}
	}
    
	var myrooms = _.filter(Game.rooms, (r) => r.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN}).length > 0 );
	for(i in myrooms){
		var towers = Game.rooms[i].find(FIND_STRUCTURES, {filter : (structure) => structure.structureType == STRUCTURE_TOWER});
		if(towers.length){
            for(i=0;i<towers.length;i++){
                tower = towers[i];
                tower.attack(tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS));
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
        if(creep.memory.role == 'harvester'){
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'builder'){
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'repairer'){
            roleRepairer.run(creep);
        }
        if(creep.memory.role == 'upgrader'){
            roleUpgrader.run(creep);
        }
		if(creep.memory.role == 'hunter'){
			roleHunter.run(creep);
		}
		if(creep.memory.role == 'miner'){
			roleMiner.run(creep);
		}
		if(creep.memory.role == 'runner'){
			roleRunner.run(creep);
		}
		if(creep.memory.role == 'reserver'){
			roleReserver.run(creep);
		}
		if(creep.memory.role == 'shield'){
		    creep.moveTo(Game.flags['Rally']);
		}
		if(creep.memory.role == 'raider'){
		    if(creep.room.name=='W54S17'){
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
		if(creep.memory.role == 'thief'){
		    if(creep.carry.energy == creep.carryCapacity && creep.room.name != Game.spawns['Spawn1'].room.name){
			    creep.moveTo(Game.flags['home'],{reusePath:5})
			}
			else if(creep.room.name == Game.spawns['Spawn1'].room.name && creep.carry.energy > 0){
			    tasks.fill(creep,[STRUCTURE_SPAWN,STRUCTURE_EXTENSION,STRUCTURE_STORAGE,STRUCTURE_CONTAINER])
			}
			else if(creep.room.name != 'W54S17' ){
				creep.moveTo(Game.flags['Steal'],{reusePath:5});
			}
			else{
				target=Game.flags['Steal'].pos.findClosestByRange(FIND_HOSTILE_STRUCTURES,{
					filter: (s) => s.energy >0
				});
				if(creep.withdraw(target,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
					creep.moveTo(target);
				}
			}
			// creep.say(creep.room.name)
	    }
	    if(creep.memory.role == 'remoteUpgrader'){
	    	remoteUpgrader.run(creep);
	    }
	    if(creep.memory.role == 'claimer'){
	    	roleClaimer.run(creep);
	    }
    }
	
	respawn.run(myrooms);
}
