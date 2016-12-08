"use strict";
// const utils = require('utils');
// var setupTask = utils.setupTask;

module.exports = {
    getGettingTask : function(creep){
        //here the prioritization of one source is missing
        var taskList = creep.room.memory.tasks;
        var getEnergyTasks = taskList[TASK_GET_ENERGY];
        var myIndex = -1;
        myIndex = _.findIndex(getEnergyTasks, (t) => t.amountAvailable == Game.getObjectById(t.id).storeCapacity);
        if(myIndex != -1){
            creep.task=getEnergyTasks[myIndex];
            getEnergyTasks[myIndex].amountAvailable -= (creep.carryCapacity - creep.carry.energy);
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
            getEnergyTasks[myIndex].amountAvailable -= (creep.carryCapacity - creep.carry.energy);
            return OK;
        }
        // //need a different solution for storages
        // if(creep.room.storage && creep.room.storage >= (creep.carryCapacity - creep.carry.energy)){
        //     creep.task= setupTask(TASK_GET_ENERGY,creep.room.storage);
        // }
    },

    getDeliveringTask : function(creep){
        //need some prioritizing logic here, for now only spawns and extensions are accounted for
        //does not account for getting the closest first yet
        var taskList = creep.room.memory.tasks;
        var deliverList = taskList[TASK_FILL];
        var myIndex = _.findIndex(deliverList, (t) => t.amountNeeded > 0);
        if(myIndex != -1){
            creep.task=deliverList[myIndex];
            deliverList[myIndex].amountNeeded -= (creep.carryCapacity - creep.carry.energy);
            return OK;
        }
    },

	run : function(creep){
		if(creep.memory.delivering && creep.carry.energy == 0) {
            creep.memory.delivering = false;
			creep.task = undefined;
            creep.say('getting');
	    }
	    if(!creep.memory.delivering && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.delivering = true;
            creep.task = undefined;
	        creep.say('delivering');
		}

        if(!creep.task){
            if(creep.memory.delivering){
                this.getDeliveringTask(creep);
            }
            else{
                if(creep.ticksToLive < 50){
                    creep.role ='recycler'
                }
                else{
                    this.getGettingTask(creep);
                }
            }
        }
		// if(creep.memory.delivering){
		// 	var mylist=[STRUCTURE_SPAWN,STRUCTURE_EXTENSION,STRUCTURE_TOWER,STRUCTURE_STORAGE];
		// 	tasks.fill(creep,mylist);
		// }
		// else if(creep.ticksToLive < 50){
		// 	creep.memory.role = 'recycler';
		// }
		// else{
		// 	var spawn = creep.room.find(FIND_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_SPAWN})[0];
		// 	var dropped = spawn.pos.findInRange(FIND_DROPPED_ENERGY,1); //energy dropped from recycling
		// 	if(dropped.length){
		// 		tasks.pick(creep,dropped[0]);
		// 	}
		// 	else{
		// 		tasks.getenergy(creep);
		// 	}
		// }
	}
}
