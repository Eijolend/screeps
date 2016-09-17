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
			var sources = creep.room.find(FIND_SOURCES);
			var mysource = sources[0]
			var mycontainer = mysource.pos.findInRange(FIND_MY_STRUCTURES,3,{filter : (s) => s.structureType == STRUCTURE_CONTAINER})[0];
			var stock = creep.room.find(FIND_STRUCTURES,{filter : (s) => s.structureType == STRUCTURE_STORAGE && s.store.energy > 0});
			
			targets = mysource.pos.findInRange(FIND_DROPPED_ENERGY,3);
			if (targets.length){
				tasks.pick(creep,targets[0])
			}
			else if(mycontainer && mycontainer.store.energy >= creep.carryCapacity){
				tasks.get(creep,mycontainer);
			}
			else if(stock.length){
				tasks.get(creep,stock[0])

			}
		}
	}
}