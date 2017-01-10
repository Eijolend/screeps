"use strict";

module.exports = {
    getMineTask : function(creep){
        var taskList = Memory.rooms[creep.memory.targetRoom].tasks;
        var mineTasks = taskList[TASK_MINE] || [];
        var myIndex = _.findIndex(mineTasks, (t) => t.assigned == 0);
        if(myIndex != -1){
            creep.task = mineTasks[myIndex];
            mineTasks[myIndex].assigned += 1; //signifies that the task has been taken over
            return OK;
        }
        else{
            return;
        }
    },

    checkContainerRepair : function(creep){
        var taskList = Memory.rooms[creep.memory.targetRoom].tasks;
        var repairList = taskList[TASK_REPAIR] || [];
        var myIndex = _.findIndex(repairList, (t) => t.id == creep.task.containerId && t.repairNeeded > 0 );
        if(myIndex != -1){
            creep.task=repairList[myIndex];
            repairList[myIndex].repairNeeded -= creep.carry.energy;
            return OK;
        }
    },

    getBuildContainer : function(creep, constructionId){

    },

    run : function(creep){
        if(!creep.task){
            this.getMineTask(creep);
        }

        if(creep.memory.workable && creep.carry.energy == 0) {
            creep.memory.workable = false;
            creep.task = undefined;
	    }
	    if(!creep.memory.workable && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.workable = true;
	    }
        //check if there is a container
        if(creep.memory.workable && !Game.getObjectById(creep.task.containerId)){
            var mySource = Game.getObjectById(creep.task.id);
            var myContainer = mySource.pos.findInRange(FIND_STRUCTURES,1,{filter: (s) => s.structureType == STRUCTURE_CONTAINER})[0];
                if(myContainer == undefined){
                    var csContainer = mysOurce.pos.findInRange(FIND_CONSTRUCTION_SITES,1,{filter:(s) => s.structureType == STRUCTURE_CONTAINER});
                    if(csContainer.length == 0){
                        creep.pos.createConstructionSite(STRUCTURE_CONTAINER);
                        _.set(Memory.rooms, creep.memory.targetRoom + ".roomManager.lastUpdated."+TASK_BUILD, 0);
                    }
                    else{
                        this.getBuildContainer(creep,csContainer[0].id);
                        _.set(Memory.rooms, creep.memory.targetRoom + ".roomManager.lastUpdated."+TASK_MINE, 0);
                    }
                }
        }
        //check if container needs repairing
        else if(creep.memory.workable && creep.ticksToLive % 20 == 0){
            this.checkContainerRepair(creep);
            _.set(Memory.rooms, creep.memory.targetRoom + ".roomManager.lastUpdated."+TASK_MINE, 0);
        }

    }
}
