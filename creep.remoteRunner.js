"use strict";
const setupTask = require("utils").setupTask;
const calcTasks = require("calcTasks");
const roleRunner = require("creep.roleRunner");

module.exports = {
	run : function(creep){
		if(creep.memory.delivering && creep.carry.energy == 0) {
            creep.memory.delivering = false;
			creep.task = undefined;
            creep.say('getting');
	    }
	    if(!creep.memory.delivering && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.delivering = true;
            creep.task = undefined;
	        creep.say('delivering');
		}

		if(creep.room.name != creep.memory.homeRoom){
			if(creep.memory.delivering){
				var roadatpoint = creep.pos.findInRange(FIND_STRUCTURES,0,{filter: (s) => s.structureType == STRUCTURE_ROAD})[0];
				var roadcs = creep.pos.findInRange(FIND_CONSTRUCTION_SITES,3,{filter: (s) => s.structureType == STRUCTURE_ROAD})[0];
				if(roadcs != undefined && (!creep.task || creep.task.type != TASK_BUILD)){
					creep.task = setupTask(TASK_BUILD,roadcs);
					return;
				}
				else if(roadatpoint != undefined && roadatpoint.hits < roadatpoint.hitsMax){
					creep.repair(roadatpoint);
				}
			}
		}

		if(!creep.task){
			if(creep.memory.delivering){
				var myStorage = Game.rooms[creep.memory.homeRoom].storage;
				if(myStorage != undefined){
					creep.task = setupTask(TASK_FILL,myStorage);
				}
				else if(creep.room.name != creep.memory.homeRoom){
					creep.moveTo(new RoomPosition(25,25,creep.memory.homeRoom));
				}
				else{
					roleRunner.getDeliveringTask(creep);
				}
			}
			else{
				if(creep.ticksToLive < 200 || creep.hits < creep.hitsMax){
					creep.role = ROLE_RECYCLER;
				}
				else{
					creep.task = JSON.parse(JSON.stringify(creep.memory.assocTask));
					creep.task.type = TASK_REMOTE_GET_ENERGY;
				}
			}
		}
	}
}
