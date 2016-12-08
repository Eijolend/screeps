"use strict";
const respawn = require('respawn');
const utils = require('utils');
var setupTask = utils.setupTask;

var setTaskList = function(room,type,taskList){
    room.memory.tasks[type] = taskList;
    _.set(room.memory, "roomManager.lastUpdated."+type, Game.time);
}

var recalcMineTasks = function(room,creepsByTask){
    var taskList = [];
    var mineCreeps = _.groupBy(creepsByTask[TASK_MINE] || [], 'task.id');
    for (var source of room.find(FIND_SOURCES)){
        var sourcetask = setupTask(TASK_MINE,source);
        sourcetask.assigned = (mineCreeps[source.id] || []).length
        sourcetask.containerId = (source.pos.findInRange(FIND_STRUCTURES,1,{filter: (s)=> s.structureType == STRUCTURE_CONTAINER})[0] || []).id; //is undefined if no container
        taskList.push(sourcetask);
    }
    setTaskList(room,TASK_MINE,taskList);
}

var recalcBuildTasks = function(room,creepsByTask){
    var taskList = [];
    var buildCreeps = _.groupBy(creepsByTask[TASK_BUILD] || [], 'task.id');
    for (var cs of room.find(FIND_MY_CONSTRUCTION_SITES)){
        var cstask = setupTask(TASK_BUILD,cs);
        cstask.progressLeft = cs.progressTotal - cs.progress - _.sum( (buildCreeps[cs.id] || []),'carry.energy');
        taskList.push(cstask);
    }
    setTaskList(room,TASK_BUILD,taskList);
}

var recalcPickupTasks = function(room,creepsByTask){
    var taskList = [];
    var pickupCreeps = _.groupBy(creepsByTask[TASK_PICKUP] || [], 'task.id');
    var sources = room.find(FIND_SOURCES);
    var spawns = room.find(FIND_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_SPAWN});
    var sourceSpawns = sources.concat(spawns);
    for (var droppedEnergy of room.find(FIND_DROPPED_RESOURCES,{filter: (r) => r.resourceType == RESOURCE_ENERGY})){ //here a estimate of how much will be left would be nice
        if(_.some(sourceSpawns, (x) => droppedEnergy.pos.isNearTo(x) )){ //here we only want those that are close to spawn or source
            var droppedtask = setupTask(TASK_PICKUP,droppedEnergy);
            droppedtask.amountLeft = droppedEnergy.amount - _.sum( (pickupCreeps[droppedEnergy.id] || []), (c) => c.carryCapacity - c.carry.energy);
            taskList.push(droppedtask);
        }
    }
    setTaskList(room,TASK_PICKUP,taskList);
}

var recalcGetEnergyTasks = function(room,creepsByTask){
    var taskList = [];
    var getEnergyCreeps = _.groupBy(creepsByTask[TASK_GET_ENERGY] || [], 'task.id');
    for (var container of room.find(FIND_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_CONTAINER})){
        var containertask = setupTask(TASK_GET_ENERGY,container);
        containertask.amountAvailable = (container.store.energy || 0) - _.sum( (getEnergyCreeps[container.id] || []), (c) => c.carryCapacity - c.carry.energy);
        taskList.push(containertask);
    }
    setTaskList(room,TASK_GET_ENERGY,taskList);
}

var recalcFillTasks = function(room,creepsByTask){
    var taskList = [];
    var fillCreeps = _.groupBy(creepsByTask[TASK_FILL] || [], 'task.id');
    for (var spex of room.find(FIND_MY_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION})){
        var spextask = setupTask(TASK_FILL,spex);
        spextask.amountNeeded = spex.energyCapacity - spex.energy - _.sum( (fillCreeps[spex.id] || []), 'carry.energy');
        taskList.push(spextask);
    }
    setTaskList(room,TASK_FILL,taskList);
}

var recalcUpgradeTasks = function(room,creepsByTask){
    var taskList = [];
    var upgradeCreeps = creepsByTask[TASK_UPGRADE] || [];
    if(room.controller != undefined){ //this needs a distinction whether this is a remoteroom or not
        var upgradetask = setupTask(TASK_UPGRADE,room.controller);
        upgradetask.ticksToDowngrade = room.controller.ticksToDowngrade;
        upgradetask.assigned = upgradeCreeps.length;
        taskList.push(upgradetask);
    }
    setTaskList(room,TASK_UPGRADE,taskList);
}

var recalcRepairTasks = function(room,creepByTask){
    var taskList = [];
    var repairCreeps = _.groupBy(creepsByTask[TASK_REPAIR] || [],'task.id');
    for (var needsRepair of room.find(FIND_STRUCTURES,{filter: (s) => s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART && s.hits < s.hitsMax })){
        var repairtask = setupTask(TASK_REPAIR,needsRepair);
        repairtask.repairNeeded = Math.ceil((needsRepair.hitsMax - needsRepair.hits)/100) - _.sum( (repairCreeps[needsRepair.id] || []), 'carry.energy');
        taskList.push(repairtask);
    }
    setTaskList(room,TASK_REPAIR,taskList);
}

var recalcRepairWallTasks = function(room,creepByTask){
    var taskList = [];
    var repairWallCreeps = _.groupBy(creepsByTask[TASK_REPAIR_WALL] || [],'task.id');
    for (var weakWall of room.find(FIND_STRUCTURES,{filter: (s) => (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) && s.hits < room.memory.wallMax})){
        var repairwalltask = setupTask(TASK_REPAIR_WALL,weakWall);
        repairwalltask.repairNeeded = Math.ceil((room.memory.wallMax - weakWall.hits)/100) - _.sum( (repairWallCreeps[weakWall.id] || []), 'carry.energy');
        taskList.push(repairwalltask);
    }
    setTaskList(room,TASK_REPAIR_WALL,taskList);
}

var recalcTasks = function(room){
    var creepsByTask;
    if( !(Game.time - _.get(room.memory,"roomManager.lastUpdated."+TASK_MINE) < 200) ){
        creepsByTask = creepsByTask != undefined ? creepsByTask : _(Game.creeps).filter( (c) => c.task && c.task.roomName == room.name).groupBy('task.type').value();
        recalcMineTasks(room,creepsByTask);
    }
    if( !(Game.time - _.get(room.memory,"roomManager.lastUpdated."+TASK_BUILD) < 50) ){
        creepsByTask = creepsByTask != undefined ? creepsByTask : _(Game.creeps).filter( (c) => c.task && c.task.roomName == room.name).groupBy('task.type').value();
        recalcBuildTasks(room,creepsByTask);
    }
    if( !(Game.time - _.get(room.memory,"roomManager.lastUpdated."+TASK_PICKUP) < 20) ){
        creepsByTask = creepsByTask != undefined ? creepsByTask : _(Game.creeps).filter( (c) => c.task && c.task.roomName == room.name).groupBy('task.type').value();
        recalcPickupTasks(room,creepsByTask);
    }
    if( !(Game.time - _.get(room.memory,"roomManager.lastUpdated."+TASK_GET_ENERGY) < 20) ){
        creepsByTask = creepsByTask != undefined ? creepsByTask : _(Game.creeps).filter( (c) => c.task && c.task.roomName == room.name).groupBy('task.type').value();
        recalcGetEnergyTasks(room,creepsByTask);
    }
    if( !(Game.time - _.get(room.memory,"roomManager.lastUpdated."+TASK_FILL) < 20) ){
        creepsByTask = creepsByTask != undefined ? creepsByTask : _(Game.creeps).filter( (c) => c.task && c.task.roomName == room.name).groupBy('task.type').value();
        recalcFillTasks(room,creepsByTask);
    }
    if( !(Game.time - _.get(room.memory,"roomManager.lastUpdated."+TASK_UPGRADE) < 20) ){
        creepsByTask = creepsByTask != undefined ? creepsByTask : _(Game.creeps).filter( (c) => c.task && c.task.roomName == room.name).groupBy('task.type').value();
        recalcUpgradeTasks(room,creepsByTask);
    }
    if( !(Game.time - _.get(room.memory,"roomManager.lastUpdated."+TASK_REPAIR) < 500) ){
        creepsByTask = creepsByTask != undefined ? creepsByTask : _(Game.creeps).filter( (c) => c.task && c.task.roomName == room.name).groupBy('task.type').value();
        recalcRepairTasks(room,creepsByTask);
    }
    if( !(Game.time - _.get(room.memory,"roomManager.lastUpdated."+TASK_REPAIR_WALL) < 500) ){
        creepsByTask = creepsByTask != undefined ? creepsByTask : _(Game.creeps).filter( (c) => c.task && c.task.roomName == room.name).groupBy('task.type').value();
        recalcRepairWallTasks(room,creepsByTask);
    }
}

module.exports = {
    run : function(room){
        if(!room.memory.tasks){
            room.memory.tasks = {};
        }
        recalcTasks(room);
        respawn.run(room);
    }
}
