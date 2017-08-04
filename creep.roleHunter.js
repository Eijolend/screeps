"use strict";

const setupTask = require('utils').setupTask;

module.exports = {
	run : function(creep){
		if(!creep.task){
			if(creep.room.memory.underAttack){
				setupTask(TASK_HUNT,Game.rooms[creep.pos.roomName].find(FIND_MY_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_SPAWN}[0]))
			}
			else if(creep.ticksToLive < 1500){
				creep.role = ROLE_RECYCLER;
			}
		}
	}
}
