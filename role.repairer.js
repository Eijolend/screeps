/* This is a builder that prefers repairing non-walls over building.
 * So having at least one of these makes sure other infrastructure
 * does not degrade while a big building project is running.
 */

var tasks=require('tasks');
// var roleBuilder=require('role.builder');
 
module.exports = {
     run: function(creep) {

	    if(creep.memory.repairing && creep.carry.energy == 0) {
            creep.memory.repairing = false;
            creep.say('getting');
	    }
	    if(!creep.memory.repairing && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.repairing = true;
	        //creep.say('repairing');
	    }
	    if(creep.memory.repairing){
			tasks.rep(creep);
	    }
		else if(creep.ticksToLive < 200){
			creep.memory.role = 'recycler';
		}
	    else { //get energy in priority: dropped, container, storage, harvest
			var sources = creep.room.find(FIND_SOURCES);
			var mysource = sources[1];
			tasks.getenergy(creep,mysource);
	    }
     }
};
