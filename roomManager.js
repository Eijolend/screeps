"use strict";
const respawn = require('respawn');

var setupTask = function(tasktype,object){
    return {type: tasktype, x: object.pos.x, y: object.pos.y, roomName: object.pos.roomName, id:object.id};
}

var recalcTasks = function(room){
    var taskList = [];
    var creepsByTask = _(Game.creeps).filter( (c) => c.task && c.task.roomName == room.name).groupBy('task.type').value();
    var mineCreeps = _.groupBy(creepsByTask[TASK_MINE] || [], 'task.id');
    for (var source of room.find(FIND_SOURCES)){
        sourcetask = setupTask(TASK_MINE,source);
        sourcetask.assigned = (mineCreeps[sourc.id] || []).length
        taskList.push(sourcetask);
    }
    var buildCreeps = _.groupBy(creepsByTask[TASK_BUILD] || [], 'task.id');
    for (var cs of room.find(FIND_MY_CONSTRUCTION_SITES)){
        var cstask = setupTask(TASK_BUILD,cs);
        cstask.progressLeft = cs.progressTotal - cs.progress - _.sum( (buildCreeps[cs.id] || []),'carry.energy');
        taskList.push(cstask);
    }
    var pickupCreeps = _.groupBy(creepsByTask[TASK_PICKUP] || [], 'task.id');
    for (var droppedEnergy of room.find(FIND_DROPPED_RESOURCES,{filter: (r) => r.resourceType == RESOURCE_ENERGY})){ //here a estimate of how much will be left would be nice
        var droppedtask = setupTask(TASK_PICKUP,droppedEnergy);
        droppedtask.amountLeft = droppedEnergy.amount - _.sum( (pickupCreeps[droppedEnergy.id] || []), (c) => c.carryCapacity - c.carry.energy);
        taskList.push(droppedtask);
    }
    var getEnergyCreeps = _.groupBy(creepsByTask[TASK_GET_ENERGY] || [], 'task.id');
    for (var container of room.find(FIND_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_CONTAINER})){
        var containertask = setupTask(TASK_GET_ENERGY,container);
        containertask.amountAvailable = (container.store.energy || 0) - _.sum( (getEnergyCreeps[container.id] || []), (c) => c.carryCapacity - c.carry.energy);
        taskList.push(containertask);
    }
    var fillCreeps = _.groupBy(creepsByTask[TASK_FILL] || [], 'task.id');
    for (var spex of room.find(FIND_MY_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION})){
        var spextask = setupTask(TASK_FILL,spex);
        spextask.amountNeeded = spex.energyCapacity - spex.energy - _.sum( (fillCreeps)[spex.id] || []), 'carry.energy');
        taskList.push(spextask);
    }
    var upgradeCreeps = creepsByTask[TASK_UPGRADE] || [];
    if(room.controller != undefined){ //this needs a distinction whether this is a remoteroom or not
        upgradetask = setupTask(TASK_UPGRADE,room.controller);
        upgradetask.ticksToDowngrade = room.controller.ticksToDowngrade;
        upgradetask.assigned = upgradeCreeps.length;
        taskList.push(upgradetask);
    }
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
