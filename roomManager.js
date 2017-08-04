"use strict";

const setupTask = require("utils").setupTask;

module.exports = {
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
				remoteRoom.memory.sources.push(remoteminetask)
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
	}
}
