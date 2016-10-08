/*
 * This role gets energy from the home room, then walks to the target room and changes
 * role according to the situation.
 */

var tasks = require('tasks');

module.exports = {
	run : function(creep){
		if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.upgrading = true;
	        creep.say('upgrading');
	    }
		if(creep.memory.upgrading){
			if(creep.room.name == Game.flags[creep.memory.myflag].pos.roomName){
				if(creep.upgradeController(creep.room.controller)==ERR_NOT_IN_RANGE){
					creep.moveTo(creep.room.controller);
				}
			}
			else{
				creep.moveTo(Game.flags[creep.memory.myflag],{reusePath:25});
			}
		}
		else{
			if(creep.room.name == Game.flags[creep.memory.myflag].pos.roomName){
				var spawns = creep.room.find(FIND_MY_STRUCTURES, {filter : (s) => s.structureType == STRUCTURE_SPAWN});
				if(!spawns.length){
					Game.flags['placespawn'].pos.createConstructionSite(STRUCTURE_SPAWN);
				}
				creep.memory.role = 'civilian'
			}
			else{
				var sources = creep.room.find(FIND_SOURCES);
				var mysource = sources[1];
				tasks.getenergy(creep,mysource);
			}
		}
	}
}
