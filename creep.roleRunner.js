"use strict";

const utils = require('utils');
var setupTask = utils.setupTask;

module.exports = {
	calcGetEnergyTasks : function(room,creepsByTask){
		var taskList = [];
		var getEnergyCreeps = _.groupBy(creepsByTask[TASK_GET_ENERGY] || [], 'task.id');
	    for (var container of room.find(FIND_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_CONTAINER})){
	        var containertask = setupTask(TASK_GET_ENERGY,container);
	        containertask.amountAvailable = (container.store.energy || 0) - _.sum( (getEnergyCreeps[container.id] || []), (c) => c.carryCapacity - c.carry.energy);
			taskList.push(containertask);
		}
		return taskList;
	},

	calcPickupTasks : function(room,creepsByTask){
		var taskList = [];
	    var pickupCreeps = _.groupBy(creepsByTask[TASK_PICKUP] || [], 'task.id');
	    var sources = room.find(FIND_SOURCES);
	    var spawns = room.find(FIND_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_SPAWN});
	    var sourceSpawns = sources.concat(spawns);
	    for (var droppedEnergy of room.find(FIND_DROPPED_RESOURCES,{filter: (r) => r.resourceType == RESOURCE_ENERGY})){ //here a estimate of how much will be left would be nice
	        if(_.some(sourceSpawns, (x) => droppedEnergy.pos.isNearTo(x) )){ //here we only want those that are close to spawn or source
	            var droppedtask = setupTask(TASK_PICKUP,droppedEnergy);
	            droppedtask.amountLeft = droppedEnergy.amount - _.sum( (pickupCreeps[droppedEnergy.id] || []), (c) => c.carryCapacity - c.carry.energy);
	            taskList.push(droppedtask);
	        }
		}
		return taskList;
	},

	calcFillTasks : function(room,creepsByTask){
		//this should account for towers as well
	    var taskList = [];
	    var fillCreeps = _.groupBy(creepsByTask[TASK_FILL] || [], 'task.id');
	    for (var spex of room.find(FIND_MY_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION})){
	        var spextask = setupTask(TASK_FILL,spex);
	        spextask.amountNeeded = spex.energyCapacity - spex.energy - _.sum( (fillCreeps[spex.id] || []), 'carry.energy');
	        taskList.push(spextask);
	    }
	    return taskList;
	},

    getGettingTask : function(creep){
        //here the prioritization of one source is missing
		var room = creep.room
		var creepsByTask = _(Game.creeps).filter( (c) => c.task && c.task.roomName == room.name).groupBy('task.type').value();
        var getEnergyTasks = this.calcGetEnergyTasks(room,creepsByTask);
        var myIndex = -1;
        myIndex = _.findIndex(getEnergyTasks, (t) => t.amountAvailable == Game.getObjectById(t.id).storeCapacity);
        if(myIndex != -1){
            creep.task=getEnergyTasks[myIndex];
            return OK;
        }
        var pickupTasks = this.calcPickupTasks(room,creepsByTask);
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
        //this should work now that we do creep-based tasks
        if(creep.room.storage && creep.room.storage >= (creep.carryCapacity - creep.carry.energy)){
            creep.task= setupTask(TASK_GET_ENERGY,creep.room.storage);
        }
    },

    getDeliveringTask : function(creep){
        //need some prioritizing logic here, for now only spawns and extensions are accounted for
        //does not account for getting the closest first yet
		var room = creep.room
		var creepsByTask = _(Game.creeps).filter( (c) => c.task && c.task.roomName == room.name).groupBy('task.type').value();
        var deliverList = this.calcFillTasks(room,creepsByTask);
        var myIndex = _.findIndex(deliverList, (t) => t.amountNeeded > 0);
        if(myIndex != -1){
            creep.task=deliverList[myIndex];
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
                    creep.role = ROLE_RECYCLER;
                }
                else{
                    this.getGettingTask(creep);
                }
            }
        }
	}
}
