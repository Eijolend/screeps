/*
 * GOAL: harvester should go to their flag and harves there.
 * 			they also should build and maintain their own road to their destination.
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
		
		if(creep.room.name != creep.memory.home){
			if(!creep.pos.findInRange(FIND_STRUCTURES,0,{filter: (s) => s.structureType == STRUCTURE_ROAD}).length){
				creep.pos.createConstructionSite(STRUCTURE_ROAD);
			}
			if(creep.memory.delivering){
				var targets = creep.room.find(FIND_CONSTRUCTION_SITES,{filter : (s) => s.structureType == STRUCTURE_ROAD);
				if (targets.length){
					tasks.construct(creep,targets[0]);
				}
				else{
					creep.moveTo(Game.spawns['Spawn1]);
				}
			}
			else{
				tasks.mine(Game.flags[creep.memory.myflag].pos.lookFor(LOOK_SOURCES)[0]);
			}
		}
		else if (creep.room.name = creep.memory.home){
			tasks.fill(creep,[STRUCTURE_STORAGE]);
		}
	}

};