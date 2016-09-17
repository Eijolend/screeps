/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.harvester');
 * mod.thing == 'a thing'; // true
 */

var tasks = require('tasks');

module.exports = {
	run: function(creep){
	    if(creep.memory.delivering && creep.carry.energy == 0) {
            creep.memory.delivering = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.delivering && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.delivering = true;
	        creep.say('delivering');
	    }
	    if(creep.memory.delivering){
			var containers = creep.room.find(FIND_STRUCTURES, {
				filter : (structure) => (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity
	    	});
			var towers = creep.room.find(FIND_STRUCTURES, { filter : (structure) => structure.structureTYPE == STRUCTURE_TOWER && structure.energy < structure.energyCapacity});
			if(containers.length){
				if(creep.transfer(containers[0],RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
			        creep.moveTo(containers[0]);
			    }
			}
			else if(towers.length){
				if(creep.transfer(towers[0],RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
			        creep.moveTo(towers[0]);
				}
			}
			else { // build stuff if everything is full
				var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
				if(targets.length){
					if(creep.build(targets[0])==ERR_NOT_IN_RANGE){
						creep.moveTo(targets[0]);
					}
				}
			}
		}
		else{
			var sources = creep.room.find(FIND_SOURCES);
    		if(creep.harvest(sources[0])==ERR_NOT_IN_RANGE){
    		        creep.moveTo(sources[0]);
    		}
		}
	}

};