var tasks = require('tasks');

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

		if(creep.room.name != creep.memory.homeRoom){
			var roadatpoint = creep.pos.findInRange(FIND_STRUCTURES,0,{filter: (s) => s.structureType == STRUCTURE_ROAD});
			if(!roadatpoint.length){
				creep.pos.createConstructionSite(STRUCTURE_ROAD);
			}
			if(creep.memory.delivering){
				var target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES,{filter : (s) => s.structureType == STRUCTURE_ROAD});
				if (target != null){
					tasks.construct(creep,target);
				}
				else{
                    if( _.filter(roadatpoint, (s) => s.hits < s.hitsMax).length){
	                   creep.repair(roadatpoint[0]);
				    }
					creep.moveTo(Game.rooms[creep.memory.homeRoom].find(FIND_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_STORAGE })[0] );
				}
			}
			else if(creep.room.name == Game.flags[creep.memory.myflag].pos.roomName){
                var dropped = Game.flags[creep.memory.myflag].pos.findInRange(FIND_DROPPED_ENERGY,3);
                var myContainer = Game.flags[creep.memory.myflag].pos.findInRange(FIND_STRUCTURES,1,{filter: (s) => s.structureType == STRUCTURE_CONTAINER})[0];

                if (myContainer != undefined && myContainer.store.energy == myContainer.storeCapacity){ //fixes container overflowing
        			tasks.get(creep,myContainer);
        		}
        		else if (dropped.length){
        			tasks.pick(creep,dropped[0]);
        		}
        		else{
        			tasks.get(creep,myContainer);
        		}
			}
            else{
                creep.moveTo(Game.flags[creep.memory.myflag]);
            }
		}
		else if (creep.room.name == creep.memory.homeRoom){
			if (creep.memory.delivering){
				tasks.fill(creep,[STRUCTURE_STORAGE]);
			}
			else if(creep.ticksToLive < 200){
				creep.memory.role = 'recycler';
			}
			else{
				creep.moveTo(Game.flags[creep.memory.myflag]);
			}
		}
    }
}
