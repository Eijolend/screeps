"use strict";

const setupTask = require('utils').setupTask;

module.exports = {
	run : function(creep){
		if(!creep.task){
			//task will get deleted once creep arrives at target room
			//now reconstruct task with proper target
			creep.task = setupTask(TASK_CLAIM,creep.room.controller);
		}
	}
}
