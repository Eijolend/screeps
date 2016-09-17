tasks = require('tasks')

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
			sources = creep.room.find(FIND_SOURCES);
			targets = sources[0].pos.findInRange(FIND_DROPPED_ENERGY,3);
			if (targets.length){
				tasks.pick(creep,target[0])
			}
			else{
				var containers = creep.room.find(FIND_STRUCTURES, { filter : (structure) => structure.structureType == STRUCTURE_CONTAINER});
				var stock = creep.room.find(FIND_STRUCTURES,{filter : (s) => s.structureType == STRUCTURE_STORAGE && s.store.energy > 0});
				if(containers[0].store.energy >= creep.carryCapacity){
					tasks.get(creep,containers[0]);
				}
				else if(stock.length){
					tasks.get(creep,stock[0])
				}
			}
		}
	}
}