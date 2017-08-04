"use strict";

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
			remoteRoom.memory.controller = remoteRoom.controller.id;
			remoteRoom.memory.sources = [];
			for(var source of remoteRoom.find(FIND_SOURCES)){
				remoteRoom.memory.sources.push(source.id);
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
