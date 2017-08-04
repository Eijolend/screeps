"use strict";

const setupTask = require('utils').setupTask;

module.exports = {
	run : function(creep){
		if(!creep.task){
			var myflag = Game.flags[creep.memory.myflag];
		    if(myflag == undefined){
		        myflag = Game.flags['Raid'];
		    }
			creep.task = setupTask(TASK_RAID,myflag)
		}
	}
}
