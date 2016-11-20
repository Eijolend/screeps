"use strict";

var getTarget = function(task){
    var myobject = Game.getObjectById(task.id)
    if(myobject != null){
        return myobject;
    }
    if(task.roomName in Game.rooms){ //if we should be able to see it but don't, it does not exist anymore
        return undefined;
    }
    return new RoomPosition(task.x,task.y,task.roomName);

}

var mine = function(creep,target){
	var mycontainer = Game.getObjectById(creep.task.containerId);
	creep.harvest(target);
	if(mycontainer != null){
		creep.moveTo(mycontainer);
	}
	else{
		creep.moveTo(target);
	}
}

var build = function(creep,target){
	creep.build(target);
	if(!creep.pos.inRangeTo(target,3)){
		creep.moveTo(target);
	}
}

var fill = function(creep,target){
	if(creep.transfer(target,RESOURCE_ENERGY) == OK){
        creep.task = undefined;
    }
	if(!creep.pos.inRangeTo(target,1)){
		creep.moveTo(target);
	}
}

var pickup = function(creep,target){
	creep.pickup(target);
	if(!creep.pos.inRangeTo(target,1)){
		creep.moveTo(target);
	}
}

var getEnergy = function(creep,target){
	creep.withdraw(target,RESOURCE_ENERGY);
	if(!creep.pos.inRangeTo(target,1)){
		creep.moveTo(target);
	}
}

var upgrade = function(creep,target){
	creep.upgradeController(target);
	if(!creep.pos.inRangeTo(target,3)){
		creep.moveTo(target);
	}
}

module.exports = {
	run: function(creep){
		if (creep.task != undefined){
			var target = getTarget(creep.task);
			switch (creep.task.type){
				case TASK_BUILD:
					build(creep,target);
					break;
				case TASK_MINE:
					mine(creep,target);
					break;
				case TASK_FILL:
					fill(creep,target);
					break;
				case TASK_PICKUP:
					pickup(creep,target);
					break;
				case TASK_GET_ENERGY:
					getEnergy(creep,target);
					break;
				case TASK_UPGRADE:
					upgrade(creep,target);
					break;
			}
		}
	}
}

module.exports.getTarget = getTarget;
