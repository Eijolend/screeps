/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.upgrader');
 * mod.thing == 'a thing'; // true
 */


tasks=require('tasks');
 
module.exports = {
    run: function(creep){
         if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.upgrading = true;
	        creep.say('upgrading');
	    }
	        
	    if(creep.memory.upgrading){
	        if(creep.upgradeController(creep.room.controller)==ERR_NOT_IN_RANGE){
	            creep.moveTo(creep.room.controller);
	        }
	    }
        else{
            var stock = creep.room.find(FIND_STRUCTURES,{filter : (s) => s.structureType == STRUCTURE_STORAGE && s.store.energy > 0});
            var containers = creep.room.find(FIND_STRUCTURES,{filter : (s) => s.structureType == STRUCTURE_CONTAINER});
            if(containers[0].store.energy > creep.carryCapacity){
    		    tasks.get(creep,containers[0]);
            }
            else if(stock.length){
                tasks.get(creep,stock[0])
    		}
			else{
				var sources = creep.room.find(FIND_SOURCES);
				tasks.mine(creep,sources[1])
			}
        }
        
    }
};