"use strict";

const utils = require('utils');
var setupTask = utils.setupTask;

module.exports = {
	calcMineTasks : function(room, creepsByTask){
		var taskList = [];
		var mineCreeps = _.groupBy(creepsByTask[TASK_MINE] || [], 'task.id');
		for (var source of room.find(FIND_SOURCES)){
			var sourcetask = setupTask(TASK_MINE,source);
	        sourcetask.assigned = (mineCreeps[source.id] || []).length
	        sourcetask.containerId = (source.pos.findInRange(FIND_STRUCTURES,1,{filter: (s)=> s.structureType == STRUCTURE_CONTAINER})[0] || []).id; //is undefined if no container
			taskList.push(sourcetask);
		}
		return taskList;
	},

    getTask : function(creep){
		var room = creep.room
		var creepsByTask = _(Game.creeps).filter( (c) => c.task && c.task.roomName == room.name).groupBy('task.type').value();
		var mineTasks = this.calcMineTasks(room,creepsByTask);
        var myIndex = _.findIndex(mineTasks, (t) => t.assigned == 0);
        if(myIndex != -1){
            creep.task = mineTasks[myIndex];
            return OK;
        }
        else{
            return;
        }
    },

    run : function(creep){
        if(!creep.task){
            this.getTask(creep);
        }
    }
}
