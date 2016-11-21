var tasks = require('tasks');

module.exports = {
	run : function(creep){
		if(creep.memory.delivering && creep.carry.energy == 0) {
            creep.memory.delivering = false;
			creep.memory.sourceNo = undefined; //resets the finding logic
            creep.say('getting');
	    }
	    if(!creep.memory.delivering && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.delivering = true;
	        creep.say('delivering');
		}
		if(creep.memory.delivering){
			var mylist=[STRUCTURE_SPAWN,STRUCTURE_EXTENSION,STRUCTURE_TOWER,STRUCTURE_STORAGE];
			tasks.fill(creep,mylist);
		}
		else if(creep.ticksToLive < 50){
			creep.memory.role = 'recycler';
		}
		else{
			var spawn = creep.room.find(FIND_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_SPAWN})[0];
			var dropped = spawn.pos.findInRange(FIND_DROPPED_ENERGY,1); //energy dropped from recycling
			if(dropped.length){
				tasks.pick(creep,dropped[0]);
			}
			else{
				tasks.getenergy(creep);
			}
		}
	}
}