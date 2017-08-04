"use strict";

const setupTask = require('utils').setupTask;

module.exports = {
	run : function(creep){
		if(!creep.task){
			var target = {};
			target.pos = new RoomPosition(25,25,creep.memory.targetRoom);
			setupTask(TASK_SCOUT,target);
		}
	}
}
