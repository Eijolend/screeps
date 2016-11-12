"use strict";
const respawn = require('respawn');

var setupTask = function(tasktype,object){
    return {type: tasktype, x: object.pos.x, y: object.pos.y, roomName: object.pos.roomName, id:object.id};
}

var recalcTasks = function(room){
    var taskList = [];
    for (var source of room.find(FIND_SOURCES)){
        taskList.push(setupTask(TASK_MINE,source));
    }
    for (var cs of room.find(FIND_MY_CONSTRUCTION_SITES)){
        var cstask = setupTask(TASK_BUILD,cs);
        cstask.progressLeft = cs.progressTotal - cs.progress - _(Game.creeps).filter( (c) => c.task && c.task.type == TASK_BUILD && c.task.id == cs.id).sum('carry.energy').value();
        taskList.push(cstask);
    }
    for (var droppedEnergy of room.find(FIND_DROPPED_RESOURCES,{filter: (r) => r.resourceType == RESOURCE_ENERGY})){
        var droppedtask = setupTask(TASK_PICKUP,droppedEnergy);
        droppedtask.amountLeft = droppedEnergy.amount - _(Game.creeps).filter( (c) => c.task && c.task.type == TASK_PICKUP && c.task.id == droppedEnergy.id).sum( (c) => c.carryCapacity - c.carry.energy).value();
        taskList.push(droppedtask);
    }
    for (var container of room.find(FIND_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_CONTAINER})){
        var containertask = setupTask(TASK_GET_ENERGY,container);
        containertask.amountAvailable = (container.store.energy || 0) - _(Game.creeps).filter( (c) => c.task && c.task.type == TASK_GET_ENERGY & c.task.id == container.id).sum((c) => c.carryCapacity - c.carry.energy).value();
        taskList.push(containertask);
    }
    for (var spex of room.find(FIND_MY_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION})){
        var spextask = setupTask(TASK_FILL,spex);
        spextask.amountNeeded = spex.energyCapacity - spex.energy - _(Game.creeps).filter( (c) => c.task && c.task.type == TASK_GET_ENERGY & c.task.id == container.id).sum('carry.energy').value();
        taskList.push(spextask);
    }
    taskList.push(setupTask(TASK_UPGRADE,room.controller)); //this might pose problems for rooms without controllers
    // still needed: towers, repairing, reparing walls
    room.memory.tasks = taskList;
}

module.exports = {
    run : function(room){
        if(Game.time % 20 == 0){
            recalcTasks(room);
        }
        respawn.run(room);
    }
}
