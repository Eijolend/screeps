"use strict";

module.exports = {
    getGettingTask : function(creep){
        //here the prioritization of one source is missing
        var taskList = creep.room.memory.tasks;
        var getEnergyTasks = taskList[TASK_GET_ENERGY];
        var myIndex = -1;
        myIndex = _.findIndex(getEnergyTasks, (t) => t.amountAvailable == Game.getObjectById(t.id).storeCapacity);
        if(myIndex != -1){
            creep.task=getEnergyTasks[myIndex];
            getEnergyTask[myIndex].amountAvailable -= (creep.carryCapacity - creep.carry.energy);
            return OK;
        }
        var pickupTasks = taskList[TASK_PICKUP];
        myIndex = _.findIndex(pickupTasks,(t) => t.amountLeft > 50); //here a better check than > 50 would be nice
        if(myIndex != -1){
            creep.task=pickupTasks[myIndex];
            pickupTasks[myIndex].amountLeft -= (creep.carryCapacity - creep.carry.energy);
            return OK;
        }
        myIndex = _.findIndex(getEnergyTasks,(t) => t.amountAvailable >= (creep.carryCapacity - creep.carry.energy));
        if(myIndex != -1){
            creep.task=getEnergyTasks[myIndex];
            getEnergyTask[myIndex].amountAvailable -= (creep.carryCapacity - creep.carry.energy);
            return OK;
        }
        // //need a different solution for storages
        // if(creep.room.storage && creep.room.storage >= (creep.carryCapacity - creep.carry.energy)){
        //     creep.task= setupTask(TASK_GET_ENERGY,creep.room.storage);
        // }
    },

    getBuildingTask : function(creep){
        var taskList = creep.room.memory.tasks;
        var buildList = taskList[TASK_BUILD];
        var myIndex = _.findIndex(buildList, (t) => t.progressLeft > 0);
        if(myIndex != -1){
            creep.task=buildList[myIndex];
            buildList[myIndex].progressLeft -= (creep.carryCapacity - creep.carry.energy);
            return OK;
        }
    },

    getUpgradingTask : function(creep){
        var taskList = creep.room.memory.tasks;
        var upgradeList = taskList[TASK_UPGRADE];
        var myIndex = _.findIndex(upgradeList, (t) => true);
        if(myIndex != -1){
            creep.task=upgradeList[myIndex];
            upgradeList[myIndex].assigned += 1;
            return OK;
        }
    },

    getRepairingTask : function(creep){
        var taskList = creep.room.memory.tasks;
        var repairList = taskList[TASK_REPAIR];
        var myIndex = _.findIndex(repairList, (t) => t.repairNeeded > 0);
        if(myIndex != -1){
            creep.task=repairList[myIndex];
            repairList[myIndex].repairNeeded -= (creep.carryCapacity - creep.carry.energy)*100;
            return OK;
        }
    },

    getWallRepairingTask : function(creep){
        var taskList = creep.room.memory.tasks;
        var repairWallList = taskList[TASK_REPAIR_WALL];
        var myIndex = _.findIndex(repairWallList, (t) => t.repairNeeded > 0);
        if(myIndex != -1){
            creep.task=repairWallList[myIndex];
            repairWallList[myIndex].repairNeeded -= (creep.carryCapacity - creep.carry.energy)*100;
            return OK;
        }
    },

    run : function(creep){
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
			creep.task = undefined;
            creep.say('getting');
	    }
	    if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.working = true;
            creep.task = undefined;
	        creep.say('working');
		}

        if(!creep.task){
            if(creep.memory.working){
                var check;
                if(creep.room.memory.tasks[TASK_UPGRADE][0].assigned < 1 && creep.room.memory.tasks[TASK_UPGRADE][0].ticksToDowngrade < 5000){ //is missing some safety checks
                    check = this.getUpgradingTask(creep);
                }
                if(check != OK){
                    check = this.getBuildingTask(creep);
                }
                if(check != OK){
                    check = this.getRepairingTask(creep); // should have some kind of limit to number of creeps that should perform this role
                }
                if(check != OK){
                    check = this.getWallRepairingTask(creep);
                }
                if(check != OK){
                    check = this.getUpgradingTask(creep);
                }
            }
            else{
                if(creep.ticksToLive < 150){
                    creep.role ='recycler'
                }
                else{
                    this.getGettingTask(creep);
                }
            }
        }

    }
}
