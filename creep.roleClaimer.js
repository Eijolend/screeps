"use strict";

const setupTask = require('utils').setupTask;

module.exports = {
	run : function(creep){
		if(!creep.task){
			if(creep.memory.myColony in Game.rooms){
				creep.task = setupTask(TASK_CLAIM,Game.rooms[creep.memory.myColony].controller);
			}
			else{
					creep.task = setupTask(TASK_CLAIM,new RoomPosition(25,25,creep.memory.myColony));
			}
		}
	}
}
