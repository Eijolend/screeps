"use strict";

module.exports = {
    getTask : function(creep){
        var taskList = creep.room.memory.tasks;
        var mineTasks = taskList[TASK_MINE] || [];
        var myIndex = _.findIndex(mineTasks, (t) => t.assigned == 0);
        if(myIndex != -1){
            creep.task = mineTasks[myIndex];
            mineTasks[myIndex].assigned += 1; //signifies that the task has been taken over
            return OK;
        }
        else{
            return;
        }
    }
}
