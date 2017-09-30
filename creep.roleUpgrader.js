"use strict";

const setupTask = require('utils').setupTask;
const calcTasks = require("calcTasks");

module.exports = {
    run : function(creep){
        if(!creep.task){
            var room = creep.room;
    		var creepsByTask = _(Game.creeps).filter( (c) => c.task && c.task.roomName == room.name).groupBy('task.type').value();
            var upgradeList = calcTasks.calcUpgradeTasks(room,creepsByTask);
            var myIndex = _.findIndex(upgradeList, (t) => true);
            if(myIndex != -1){
                var upgradeContainer = room.controller.pos.findInRange(FIND_STRUCTURES,1,{filter: (s) => s.structureType == STRUCTURE_CONTAINER})[0];
                creep.task=upgradeList[myIndex];
                if(upgradeContainer != undefined){
                    creep.task.containerId = upgradeContainer.id;
                }
                return OK;
            }
        }
    }
}
