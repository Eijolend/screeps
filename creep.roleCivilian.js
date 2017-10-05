"use strict";

const setupTask = require('utils').setupTask;
const calcTasks = require("calcTasks");

module.exports = {
	getGettingTask : function(creep){
        //here the prioritization of one source is missing
		var room = creep.room;
		var creepsByTask = _(Game.creeps).filter( (c) => c.task && c.task.roomName == room.name).groupBy('task.type').value();
        var getEnergyTasks = calcTasks.calcGetEnergyTasks(room,creepsByTask);
        var myIndex = -1;
        myIndex = _.findIndex(getEnergyTasks, (t) => t.amountAvailable == Game.getObjectById(t.id).storeCapacity);
        if(myIndex != -1){
            creep.task=getEnergyTasks[myIndex];
            return OK;
        }
        var pickupTasks = calcTasks.calcPickupTasks(room,creepsByTask);
        myIndex = _.findIndex(pickupTasks,(t) => t.amountLeft > 50); //here a better check than > 50 would be nice
        if(myIndex != -1){
            creep.task=pickupTasks[myIndex];
            return OK;
        }
        myIndex = _.findIndex(getEnergyTasks,(t) => t.amountAvailable >= (creep.carryCapacity - creep.carry.energy));
        if(myIndex != -1){
            creep.task=getEnergyTasks[myIndex];
            return OK;
        }
        //this should work now that we do creep-based tasks, but should reset when empty
        if(creep.room.storage && creep.room.storage.store.energy >= (creep.carryCapacity - creep.carry.energy)){
            creep.task= setupTask(TASK_GET_ENERGY,creep.room.storage);
			return OK;
        }
    },

    getBuildingTask : function(creep){
		var room = creep.room;
		var creepsByTask = _(Game.creeps).filter( (c) => c.task && c.task.roomName == room.name).groupBy('task.type').value();
        var buildList = calcTasks.calcBuildTasks(room,creepsByTask);
        var myIndex = _.findIndex(buildList, (t) => t.progressLeft > 0);
        if(myIndex != -1){
            creep.task=buildList[myIndex];
            return OK;
        }
    },

    getUpgradingTask : function(creep){
		var room = _.get(Game.rooms, creep.memory.homeRoom, creep.room);
		var creepsByTask = _(Game.creeps).filter( (c) => c.task && c.task.roomName == room.name).groupBy('task.type').value();
        var upgradeList = calcTasks.calcUpgradeTasks(room,creepsByTask);
        var myIndex = _.findIndex(upgradeList, (t) => true);
        if(myIndex != -1){
            creep.task=upgradeList[myIndex];
            return OK;
        }
    },

    getRepairingTask : function(creep){
        var repairList = _.get(creep.room.memory,"tasks." + TASK_REPAIR,[]);
        var myIndex = _.findIndex(repairList, (t) => t.repairNeeded > 0);
        if(myIndex != -1){
			repairList[myIndex].repairNeeded -= creep.carry.energy;
            creep.task=repairList[myIndex];
            return OK;
        }
    },

    getWallRepairingTask : function(creep){
		var repairWallList = _.get(creep.room.memory,"tasks." + TASK_REPAIR_WALL,[]);
		var myIndex = _.findIndex(repairWallList, (t) => t.repairNeeded > 0);
        if(myIndex != -1){
			repairWallList[myIndex].repairNeeded -= creep.carry.energy;
            creep.task=repairWallList[myIndex];
            return OK;
        }
    },

	getMiningTask : function(creep){
		var room = creep.room;
		var creepsByTask = _(Game.creeps).filter( (c) => c.task && c.task.roomName == room.name).groupBy('task.type').value();
		var mineTasks = calcTasks.calcMineTasks(room,creepsByTask);
		var myIndex = _.min(_.keys(mineTasks), function(k) { return mineTasks[k].assigned;})
		if(myIndex != -1){
			creep.task = mineTasks[myIndex];
			creep.task.containerId = undefined; //civilians ignore containers
			return OK;
		}
		else{
			return;
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
				var creepsByTask =  _(Game.creeps).filter( (c) => c.task && c.task.roomName == creep.room.name).groupBy('task.type').value();
				var upgradeCreeps = creepsByTask[TASK_UPGRADE] || [];
				var repairCreeps = creepsByTask[TASK_REPAIR] || [];
				var repairWallCreeps = creepsByTask[TASK_REPAIR_WALL] || [];
				if(upgradeCreeps.length < 1 && Game.rooms[creep.memory.homeRoom].controller.ticksToDowngrade < 5000){ //is missing some safety checks
                    check = this.getUpgradingTask(creep);
                }
                if(check != OK){
                    check = this.getBuildingTask(creep);
                }
                if(check != OK && repairCreeps.length < 1){ //at most 1 creep on repairing duties
                    check = this.getRepairingTask(creep);
				}
                if(check != OK && repairWallCreeps.length < 1){ //should allow more creeps to repair in emergency
                    check = this.getWallRepairingTask(creep);
                }
                if(check != OK && Game.rooms[creep.memory.homeRoom].controller.level < 8){
                    check = this.getUpgradingTask(creep);
                }
            }
            else{
                if(creep.ticksToLive < 150 && creep.room.find(FIND_MY_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_SPAWN}).length > 0){
                    creep.role = ROLE_RECYCLER;
                }
                else{
                    var status = this.getGettingTask(creep);
					if(status != OK){
						this.getMiningTask(creep);
					}
                }
            }
        }

    }
}
