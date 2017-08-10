"use strict";

const setupTask = require('utils').setupTask;
const calcTasks = require("calcTasks");

module.exports = {
    getTask : function(creep){
		var room = creep.room
		var creepsByTask = _(Game.creeps).filter( (c) => c.task && c.task.roomName == room.name).groupBy('task.type').value();
		var mineMineralTasks = calcTasks.calcMineMineralTasks(room,creepsByTask);
        var myIndex = _.findIndex(mineMineralTasks, (t) => t.assigned == 0);
        if(myIndex != -1){
            creep.task = mineMineralTasks[myIndex];
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
