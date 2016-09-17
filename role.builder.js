/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.builder');
 * mod.thing == 'a thing'; // true
 */

tasks=require('tasks')
 
 
module.exports = {
     run: function(creep) {

	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	        creep.say('building');
	    }
	    if(creep.memory.building){
			var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
			var towers = creep.room.find(FIND_STRUCTURES, {filter : (structure) => structure.structureType == STRUCTURE_TOWER && structure.energy < structure.energyCapacity});
			if(targets.length){
				tasks.construct(creep,targets[0]);
			}
			else if(towers.length){
				tasks.fill(creep,[STRUCTURE_TOWER]);
			}
			else{
				tasks.rep(creep,50000)
			}
			
	        // 
			// 
	        // if(targets.length){
	            // if(creep.build(targets[0])==ERR_NOT_IN_RANGE){
    	            // creep.moveTo(targets[0]);
	            // }
	        // }
	        // else if(towers.length){
	            // if(creep.transfer(towers[0],RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
    		        // creep.moveTo(towers[0]);
	            // }
	        // }
			// else{
				// target=creep.pos.findClosestByRange(FIND_STRUCTURES, {filter : (structure) => (
                    // structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART && structure.hits < structure.hitsMax) || (
                    // (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART) && structure.hits < 10000)
				// });
				// if(creep.repair(target) == ERR_NOT_IN_RANGE){
					// creep.moveTo(target);
				// }
			// }
	    }
	    else {
		    var stock = creep.room.find(FIND_STRUCTURES,{filter : (s) => s.structureType == STRUCTURE_STORAGE && s.store.energy > 0});
            var containers = creep.room.find(FIND_STRUCTURES,{filter : (s) => s.structureType == STRUCTURE_CONTAINER});
            if(containers[1].store.energy >= creep.carryCapacity){
    		    tasks.get(creep,containers[1]);
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