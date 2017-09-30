"use strict";
const setupTask = require("utils").setupTask;

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

	calcMineMineralTasks : function(room,creepsByTask){
		var taskList = [];
		var mineMineralCreeps = _.groupBy(creepsByTask[TASK_MINE_MINERAL] || [], 'task.id');
		var mineral = room.find(FIND_MINERALS)[0];
		var mineraltask = setupTask(TASK_MINE_MINERAL,mineral);
		mineraltask.assigned = (mineMineralCreeps[mineral.id] || []).length
		mineraltask.containerId = (mineral.pos.findInRange(FIND_STRUCTURES,1,{filter: (s)=> s.structureType == STRUCTURE_CONTAINER})[0] || []).id; //is undefined if no container
		taskList.push(mineraltask);
		return taskList;
	},

	calcGetEnergyTasks : function(room,creepsByTask){
		var taskList = [];
		var getEnergyCreeps = _.groupBy(creepsByTask[TASK_GET_ENERGY] || [], 'task.id');
		for (var container of room.find(FIND_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_CONTAINER})){
			if(container.pos.isNearTo(room.controller)){ //the upgrader's container should not be emptied
				continue;
			}
			var containertask = setupTask(TASK_GET_ENERGY,container);
			containertask.amountAvailable = (container.store.energy || 0) - _.sum( (getEnergyCreeps[container.id] || []), (c) => c.carryCapacity - c.carry.energy);
			taskList.push(containertask);
		}
		return taskList;
	},

	calcPickupTasks : function(room,creepsByTask){
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
		return taskList;
	},

	calcFillTasks : function(room,creepsByTask){
		//prioritization is not solved yet
		var taskList = [];
		var fillCreeps = _.groupBy(creepsByTask[TASK_FILL] || [], 'task.id');
		for (var spex of room.find(FIND_MY_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION})){
			var spextask = setupTask(TASK_FILL,spex);
			spextask.amountNeeded = spex.energyCapacity - spex.energy - _.sum( (fillCreeps[spex.id] || []), 'carry.energy');
			spextask.structureType = spex.structureType;
			taskList.push(spextask);
		}
		//the order of adding them to the tasklist might be used for something, but currently it is just sorted afterwards
		for (var tower of room.find(FIND_MY_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_TOWER})){
			var towertask = setupTask(TASK_FILL,tower);
			towertask.amountNeeded = tower.energyCapacity - tower.energy - _.sum( (fillCreeps[tower.id] || []), 'carry.energy');
			towertask.structureType = tower.structureType;
			taskList.push(towertask);
		}
		var upgradeContainer = room.controller.pos.findInRange(FIND_STRUCTURES,1,{filter:(s) => s.structureType == STRUCTURE_CONTAINER})[0];
		if(upgradeContainer != undefined){
			var containertask = setupTask(TASK_FILL,upgradeContainer);
			containertask.amountNeeded = upgradeContainer.storeCapacity - (upgradeContainer.store.energy || 0 ) - _.sum( (fillCreeps[upgradeContainer.id] || []), 'carry.energy');
			containertask.structureType = upgradeContainer.structureType;
			taskList.push(containertask);
		}

		return taskList;
	},

	calcBuildTasks : function(room,creepsByTask){
	    var taskList = [];
	    var buildCreeps = _.groupBy(creepsByTask[TASK_BUILD] || [], 'task.id');
	    for (var cs of room.find(FIND_MY_CONSTRUCTION_SITES)){
	        var cstask = setupTask(TASK_BUILD,cs);
	        cstask.progressLeft = cs.progressTotal - cs.progress - _.sum( (buildCreeps[cs.id] || []),'carry.energy');
	        taskList.push(cstask);
	    }
    	return taskList;
	},

	calcUpgradeTasks : function(room,creepsByTask){
	    var taskList = [];
	    var upgradeCreeps = creepsByTask[TASK_UPGRADE] || [];
	    if(room.controller != undefined){ //this needs a distinction whether this is a remoteroom or not
	        var upgradetask = setupTask(TASK_UPGRADE,room.controller);
	        upgradetask.ticksToDowngrade = room.controller.ticksToDowngrade;
	        upgradetask.assigned = upgradeCreeps.length;
	        taskList.push(upgradetask);
	    }
	    return taskList;
	},

	calcRepairTasks : function(room,creepsByTask){
	    var taskList = [];
	    var repairCreeps = _.groupBy(creepsByTask[TASK_REPAIR] || [],'task.id');
	    for (var needsRepair of room.find(FIND_STRUCTURES,{filter: (s) => s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART && s.hits < s.hitsMax })){
	        var repairtask = setupTask(TASK_REPAIR,needsRepair);
	        repairtask.repairNeeded = Math.ceil((needsRepair.hitsMax - needsRepair.hits)/100) - _.sum( (repairCreeps[needsRepair.id] || []), 'carry.energy');
	        taskList.push(repairtask);
	    }
	    return taskList;
	},

	calcRepairWallTasks : function(room,creepsByTask){
	    var taskList = [];
	    var repairWallCreeps = _.groupBy(creepsByTask[TASK_REPAIR_WALL] || [],'task.id');
	    for (var weakWall of room.find(FIND_STRUCTURES,{filter: (s) => (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) && s.hits < room.memory.wallMax})){
	        var repairwalltask = setupTask(TASK_REPAIR_WALL,weakWall);
	        repairwalltask.repairNeeded = Math.ceil((room.memory.wallMax - weakWall.hits)/100) - _.sum( (repairWallCreeps[weakWall.id] || []), 'carry.energy');
	        taskList.push(repairwalltask);
	    }
	    return taskList;
	}
}
