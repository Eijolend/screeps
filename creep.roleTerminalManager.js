"use strict";

const setupTask = require('utils').setupTask;
const calcTasks = require("calcTasks");
const roleRunner = require("creep.roleRunner");

module.exports = {
	run : function(creep){
		if(creep.memory.delivering && _.sum(creep.carry) == 0) {
            creep.memory.delivering = false;
			creep.task = undefined;
            creep.say('getting');
	    }
	    if(!creep.memory.delivering && _.sum(creep.carry) == creep.carryCapacity) {
	        creep.memory.delivering = true;
            creep.task = undefined;
	        creep.say('delivering');
		}

		if(!creep.task){
			if(creep.memory.delivering){
				var resourceType = creep.carry[_.findKey(creep.carry, (x) => x > 0)];
				if(resourceType != RESOURCE_ENERGY){
					creep.task = setupTask(TASK_FILL,creep.room.terminal);
					creep.task.resourceType = resourceType;
					return OK;
				}
				else if(creep.room.storage && creep.room.storage.store.energy > 100000 && creep.room.terminal && creep.room.terminal.store.energy < 50000){
					creep.task = setupTask(TASK_FILL,creep.room.terminal);
					return OK;
				}
				else{
					roleRunner.run(creep);
				}
			}
			else{
				var mineral = creep.room.find(FIND_MINERALS)[0];
		        var mineralType = mineral.mineralType;
				var mineralContainer = mineral.pos.findInRange(FIND_STRUCTURES,1,{filter:(s)=>s.structureType == STRUCTURE_CONTAINER})[0];
				if(mineralContainer != undefined && creep.room.terminal != undefined && mineralContainer.store[mineralType] >= creep.carryCapacity){
					creep.task = setupTask(TASK_GET, mineralContainer);
					creep.task.resourceType = mineralType;
					return OK;
				}
				else{
					roleRunner.run(creep);
				}
			}
		}

	}
}
