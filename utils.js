"use strict";

module.exports = {
    isPosEqual : function(firstPos,secondPos){
        if(!(firstPos && secondPos)){
            return false
        }
        return firstPos.x === secondPos.x && firstPos.y === secondPos.y && firstPos.roomName === secondPos.roomName;
    },
    setupTask : function(tasktype,object){
		//if object is a RoomPosition, will return a task with undefined id
		//if id is undefined role will need to reconstruct its own task once the target room is reached.
		var pos = object.pos != undefined ? object.pos : object;
        return {type: tasktype, x: pos.x, y: pos.y, roomName: pos.roomName, id:object.id};
    }
}
