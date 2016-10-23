module.exports = {
    isPosEqual : function(firstPos,secondPos){
        return firstPos.x === secondPos.x && firstPos.y === secondPos.y && firstPos.roomName === secondPos.roomName
    }
}
