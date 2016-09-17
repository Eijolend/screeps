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
         else { //get energy in priority: dropped, container, storage, harvest
			var sources = creep.room.find(FIND_SOURCES);
			var mysource = sources[1];
			var mycontainer = mysource.pos.findInRange(FIND_MY_STRUCTURES,3,{filter : (s) => s.structureType == STRUCTURE_CONTAINER});
			var stock = creep.room.find(FIND_STRUCTURES,{filter : (s) => s.structureType == STRUCTURE_STORAGE && s.store.energy > 0});
			
			var targets = mysource.pos.findInRange(FIND_DROPPED_ENERGY,3);
			if (targets.length){
				tasks.pick(creep,targets[0]);
			}
			else if(mycontainer.store.energy >= creep.carryCapacity){
				tasks.get(creep,mycontainer);
			}
            else if(stock.length){
                tasks.get(creep,stock[0])
    		}
			else{
				tasks.mine(creep,mysource)
			}
	    }
    }
};