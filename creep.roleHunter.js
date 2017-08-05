"use strict";

const setupTask = require('utils').setupTask;

module.exports = {
	run : function(creep){
		if(!creep.task){
			if(creep.room.memory.underAttack){
				creep.task = setupTask(TASK_HUNT,creep.room.controller);
			}
			else if(creep.room.name != creep.memory.homeRoom){
				creep.moveTo(new RoomPosition(25,25,creep.memory.homeRoom));
			}
			else{
				for(var remoteRoomName of Memory.rooms[creep.memory.homeRoom].remoteRooms){
					if(Memory.rooms[remoteRoomName].underAttack){
						creep.task = JSON.parse(JSON.stringify(Memory.rooms[remoteRoomName].controller));
						creep.task.type = TASK_HUNT;
						return;
					}
				}
				if(creep.ticksToLive < 1500){
					creep.role = ROLE_RECYCLER;
				}
			}
		}
	}
}
