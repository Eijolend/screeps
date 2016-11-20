"use strict";

module.exports = {
    isPosEqual : function(firstPos,secondPos){
        if(!(firstPos && secondPos)){
            return false
        }
        return firstPos.x === secondPos.x && firstPos.y === secondPos.y && firstPos.roomName === secondPos.roomName;
    },
    setupTask : function(tasktype,object){
        return {type: tasktype, x: object.pos.x, y: object.pos.y, roomName: object.pos.roomName, id:object.id};
    }
}
