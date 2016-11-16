"use strict";

const tasks = require("tasks");
const roleMiner = require('creep.roleMiner');
const roleRunner = require('creep.roleRunner');
const roleCivilian = require('creep.roleCivilian');

module.exports = {
    run : function(creep){
        if(creep.task == undefined || tasks.getTarget(creep.task) == undefined){ //if no task or the target does not exist anymore
            switch (creep.role){
                case "miner":
                    roleMiner.getTask(creep);
                    break;
                case "runner":
                    roleRunner.getTask(creep);
                    break;
                case "civilian":
                    roleCivilian.getTask(creep);
                    break;
            }
        }

        if (creep.task != undefined){
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
                case TASK_UPGRADE:
                    tasks.upgrade(creep);
                    break;
            }
        }
    }
}
