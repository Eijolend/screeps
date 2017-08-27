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
        for(var lab of creep.room.memory.labManager.labs){
            labs.push(Game.getObjectById(lab.id));
        }
		//now actual logic starts
        if(labs[0].mineralType){
			creep.task = setupTask(TASK_EMPTY_LAB,labs[0]);
			return OK;
        }
        if(labs[1].mineralType){
            creep.task = setupTask(TASK_EMPTY_LAB,labs[1]);
            return OK;
        }
        if(labs[2].mineralType){
            creep.task = setupTask(TASK_EMPTY_LAB,labs[2]);
            return OK;
        }
        if(!creep.memory.setup){
            creep.task = setupTask(TASK_SETUP_LABS,creep); //if there are no orders TASK_SETUP_LABS will lead to the laborant orderly leaving their workplace
            return OK;
        }
        creep.memory.task = setupTask(TASK_LABORANT,creep);
		creep.task.timeStamp = Game.time; //for multiple labblocks, here we should also specify which blocks
        creep.memory.setup = false;
		return OK;
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
