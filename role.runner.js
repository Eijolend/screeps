var tasks = require('tasks')

module.exports = {
	run : function(creep){
		if(creep.memory.delivering && creep.carry.energy == 0) {
            creep.memory.delivering = false;
            creep.say('getting');
	    }
	    if(!creep.memory.delivering && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.delivering = true;
	        creep.say('delivering');
		}
		if(creep.memory.delivering){
			mylist=[STRUCTURE_SPAWN,STRUCTURE_EXTENSION,STRUCTURE_TOWER,STRUCTURE_STORAGE];
			tasks.fill(creep,mylist);
		}
		else{
			var sources = creep.room.find(FIND_SOURCES);
			var mysource = sources[0]
			tasks.getenergy(creep,mysource);
		}
	}
}
