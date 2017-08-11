"use strict";

const setupTask = require("utils").setupTask;

module.exports = {
	calcCarryNeeded : function(capacity,steps){
		return Math.ceil(capacity / ENERGY_REGEN_TIME * 2 * steps / CARRY_CAPACITY);
	},

	remoteUpdate : function(remoteRoomName,homeRoomName){
		let homeRoom = Game.rooms[homeRoomName];
		if(!Game.rooms[remoteRoomName]){
			homeRoom.requestCreep([MOVE],undefined,{role:ROLE_SCOUT,targetRoom:remoteRoomName});
			return -1;
		}
		else{
			let remoteRoom = Game.rooms[remoteRoomName];
			//note down controller and sources
			remoteRoom.memory.controller = setupTask(TASK_RESERVE,remoteRoom.controller)
			remoteRoom.memory.sources = [];
			for(var source of remoteRoom.find(FIND_SOURCES)){
				var remoteminetask = setupTask(TASK_REMOTE_MINE, source);
				if(homeRoom.storage){
					var steps = PathFinder.search(homeRoom.storage.pos,{pos:source.pos,range:1},{swampcost : 1}).path.length;
					remoteminetask.carryNeeded = this.calcCarryNeeded(source.energyCapacity,steps);
				}
				remoteRoom.memory.sources.push(remoteminetask);
			}
			return OK;
		}
	},

	remoteInit : function(remoteRoomName,homeRoomName){
        _.set(Memory, "rooms." + remoteRoomName + ".remoteRoom", true);
        _.set(Memory, "rooms." + remoteRoomName + ".homeRoom", homeRoomName)
        let homeRoom = Game.rooms[homeRoomName];
        if(!homeRoom.memory.remoteRooms){
            homeRoom.memory.remoteRooms = [];
        }
        homeRoom.memory.remoteRooms.push(remoteRoomName);
        this.remoteUpdate(remoteRoomName,homeRoomName);
	},

	remoteUpdateAll : function(){ //useful when something was changed about updating logic
		for(var roomName in Game.rooms){
			if(Memory.rooms[roomName].remoteRooms){
				for(var remoteRoomName of Memory.rooms[roomName].remoteRooms){
					this.remoteUpdate(remoteRoomName,roomName);
				}
			}
		}
	},

	colonizeRoom : function(colonyRoomName, homeRoomName, spawnPosX, spawnPosY, waypoint){
		var waypoint = waypoint;
		if(waypoint == undefined){
			waypoint = [];
		}
		_.set(Memory, "rooms." + colonyRoomName + ".spawnpos", {x:spawnPosX,y:spawnPosY});
		_.set(Memory, "rooms." + colonyRoomName + ".waypoint", waypoint);

		let homeRoom = Game.rooms[homeRoomName];
		if(!homeRoom.memory.colonies){
			homeRoom.memory.colonies = [];
		}
		homeRoom.memory.colonies.push(colonyRoomName);

		var claimtask = setupTask(TASK_CLAIM, new RoomPosition(25,25,colonyRoomName));
		Game.rooms[homeRoomName].requestCreep([CLAIM,MOVE],undefined,{role:ROLE_CLAIMER,task:claimtask,myColony : colonyRoomName});
	}
}
