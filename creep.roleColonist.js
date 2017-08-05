"use strict";

const setupTask = require('utils').setupTask;

module.exports = {
	run : function(creep){
		var myflag = Game.flags[creep.memory.myflag];
		if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.say('getting');
	    }
	    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.upgrading = true;
	        creep.say('upgrading');
	    }

		if(!creep.task){
			if(creep.memory.upgrading){
				if(creep.memory.myColony in Game.rooms){
					creep.task = setupTask(TASK_UPGRADE,creep.room.controller);
				}
				else{
					creep.task = setupTask(TASK_UPGRADE,new RoomPosition(25,25,creep.memory.myColony));
					creep.memory.waypoint = Memory.rooms[creep.memory.myColony].waypoint;
				}
			}
			else{
				if(creep.room.name == creep.memory.homeRoom){
					creep.task = setupTask(TASK_GET_ENERGY,creep.room.storage); //I shouldn't colonize from a room without storage anyway
				}
				else{
					var spawns = creep.room.find(FIND_MY_STRUCTURES, {filter : (s) => s.structureType == STRUCTURE_SPAWN});
					if(!spawns.length){
						var spawnpos = Memory.rooms[creep.memory.myColony].spawnpos
						var spawnposition = new RoomPosition(spawnpos.x, spawnpos.y, creep.memory.myColony);
						spawnposition.createConstructionSite(STRUCTURE_SPAWN);
					}
					creep.role = ROLE_CIVILIAN;
					creep.memory.homeRoom = creep.memory.myColony;
				}
			}
		}
	}
}
