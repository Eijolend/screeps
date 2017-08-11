"use strict";

const calcTasks = require("calcTasks");
const respawn = require("respawn");

var setTaskList = function(room,type,taskList){
    room.memory.tasks[type] = taskList;
    _.set(room.memory, "roomManager.lastUpdated."+type, Game.time);
}

var recalcTasks = function(room){
	var creepsByTask;
	if( !(Game.time - _.get(room.memory,"roomManager.lastUpdated."+TASK_FILL) < 50) ){
		creepsByTask = creepsByTask != undefined ? creepsByTask : _(Game.creeps).filter( (c) => c.task && c.task.roomName == room.name).groupBy('task.type').value();
		var taskList = calcTasks.calcFillTasks(room,creepsByTask);
		setTaskList(room,TASK_FILL,taskList);
	}
	if( !(Game.time - _.get(room.memory,"roomManager.lastUpdated."+TASK_REPAIR) < 500) ){
        creepsByTask = creepsByTask != undefined ? creepsByTask : _(Game.creeps).filter( (c) => c.task && c.task.roomName == room.name).groupBy('task.type').value();
		var taskList = calcTasks.calcRepairTasks(room,creepsByTask);
		taskList = _(taskList).sortBy("repairNeeded").reverse().value();
		setTaskList(room,TASK_REPAIR,taskList);
	}
	if( !(Game.time - _.get(room.memory,"roomManager.lastUpdated."+TASK_REPAIR_WALL) < 50) ){
        creepsByTask = creepsByTask != undefined ? creepsByTask : _(Game.creeps).filter( (c) => c.task && c.task.roomName == room.name).groupBy('task.type').value();
		var taskList = calcTasks.calcRepairWallTasks(room,creepsByTask);
		taskList = _(taskList).sortBy("repairNeeded").reverse().value();
		setTaskList(room,TASK_REPAIR_WALL,taskList);
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
