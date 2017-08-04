"use strict";
const setupTask = require("utils").setupTask;

module.exports = {
    run : function(creep){
        if(!creep.task){
            let mySpawn = Game.rooms[creep.memory.homeRoom].find(FIND_MY_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_SPAWN})[0];
			//might be slightly better to look Game.spawns for pos.roomName
            creep.task = setupTask(TASK_RECYCLE,mySpawn);
        }
    }
}
