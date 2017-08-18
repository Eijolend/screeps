"use strict";

const setupTask = require("utils").setupTask;
const labManager = require("labManager");

module.exports = {
    getTask : function(creep){
        if(!creep.room.memory.labManager){
            labManager.init(creep.room);
        }
        var orders = creep.room.memory.labManager.orders;
        var order = {};
        if(orders){order = orders[0]};
        if(!(creep.room.memory.labManager.labs.length>=3)){
            labManager.init(creep.room);
            return;
        }
        var labs = [];
        for(lab of creep.room.memory.labManager.labs){
            labs.push(Game.getObjectById(lab.id));
        }
        // more logic goes here
    },

    run : function(creep){
        if(!creep.task){
            if(creep.ticksToLive < 15){
                if(_.sum(creep.carry) > 0){
                    creep.transfer(creep.room.terminal,_.findKey(creep.carry,(x) => x > 0));
                }
                else{
                    creep.suicide();
                }
            }
            else{
                this.getTask(creep);
            }
        }
    }
}
