"use strict";

const tasks = require("tasks");

module.exports = {
    run : function(creep){
        if(!creep.task){
            creep.task = {};
        }

        switch (creep.task.type){
            case TASK_BUILD:
                tasks.build(creep);
                break;
            case TASK_MINE:
                tasks.mine(creep);
                break;
            case TASK_FILL:
                tasks.fill(creep);
                break;
            case TASK_PICKUP:
                tasks.pickup(creep);
                break;
            case TASK_GET_ENERGY:
                tasks.getEnergy(creep);
                break;
        }
    }
}
