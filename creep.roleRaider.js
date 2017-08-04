"use strict";

const setupTask = require('utils').setupTask;

module.exports = {
	run : function(creep){
		if(!creep.task){
			var myflag = Game.flags[creep.memory.myflag];
		    if(myflag == undefined){
		        myflag = Game.flags['Raid'];
		    }
			if(creep.memory.raidMode == "guard"){
				creep.task = setupTask(TASK_GUARD,myflag);
			}
			else{
				creep.task = setupTask(TASK_RAID,myflag);
			}
		}
	}
}
