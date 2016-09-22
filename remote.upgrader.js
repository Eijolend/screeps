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
				//upgrade
			}
			else{
				//moveTo myflag
			}
		}
		else{
			if(creep.room.name == Game.flags[creep.memory.myflag].pos.roomName){
				//change to builder and place down a spawn if there is no spawn, else change to normal upgrader in new room
			}
			else{
				var sources = creep.room.find(FIND_SOURCES);
				var mysource = sources[1];
				tasks.getenergy(creep,mysource);
			}
		}
	}
}