/*
 * Remote mining role, that should build and maintain their own container.
 */

var tasks = require('tasks');

module.exports = {
    run : function(creep){
        if(creep.memory.workable && creep.carry.energy == 0) {
            creep.memory.workable = false;
            // creep.say('getting');
	    }
	    if(!creep.memory.workable && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.workable = true;
	        // creep.say('delivering');
	    }
        var myflag = Game.flags[creep.memory.myflag];
        if(creep.room.name == myflag.pos.roomName){
            if(creep.memory.workable){
                var myContainer = myflag.pos.findInRange(FIND_STRUCTURES,1,{filter: (s) => s.structureType == STRUCTURE_CONTAINER})[0];
                if(myContainer == undefined){
                    var csContainer = myflag.pos.findInRange(FIND_CONSTRUCTION_SITES,1,{filter:(s) => s.structureType == STRUCTURE_CONTAINER});
                    if(csContainer.length == 0){
                        creep.pos.createConstructionSite(STRUCTURE_CONTAINER);
                    }
                    tasks.construct(creep,csContainer[0]);
                }
                else if(myContainer.hits < myContainer.hitsMax){
                    creep.repair(myContainer);
                }
                else{
                    var mySource = myflag.pos.lookFor(LOOK_SOURCES)[0];
                    tasks.mine(creep,mySource);
                }
            }
            else{
                var mySource = myflag.pos.lookFor(LOOK_SOURCES)[0];
                tasks.mine(creep,mySource);
            }
        }
        else{
            creep.moveTo(myflag);
        }
    }
}
