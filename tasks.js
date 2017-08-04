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
    var status = creep.transfer(target,RESOURCE_ENERGY);
	if(status == OK || status == ERR_FULL){
        creep.task = undefined;
    }
	if(!creep.pos.isNearTo(target)){
		creep.moveTo(target);
	}
}

var pickup = function(creep,target){
	creep.pickup(target);
	if(!creep.pos.isNearTo(target)){
		creep.moveTo(target);
	}
}

var getEnergy = function(creep,target){
	creep.withdraw(target,RESOURCE_ENERGY);
	if(!creep.pos.isNearTo(target)){
		creep.moveTo(target);
	}
}

var upgrade = function(creep,target){
	creep.upgradeController(target);
	if(!creep.pos.inRangeTo(target,3)){
		creep.moveTo(target);
	}
}

var repair = function(creep,target){
    if(target && target.hits == target.hitsMax){
        creep.task = undefined;
        return;
    }
    creep.repair(target);
    if(!creep.pos.inRangeTo(target,3)){
		creep.moveTo(target);
	}
}

var repairWall = function(creep,target){
    if(target && target.hits >= creep.room.memory.wallMax){
        creep.task = undefined;
        return;
    }
    creep.repair(target);
    if(!creep.pos.inRangeTo(target,3)){
		creep.moveTo(target);
	}
}

var recycle = function(creep,target){
    if(target && target.structureType == STRUCTURE_SPAWN){
        target.recycleCreep(creep);
    }
    if(!creep.pos.isNearTo(target)){
        creep.moveTo(target);
    }
}

var reserve = function(creep,target){
    creep.reserveController(target);
    if(!creep.pos.isNearTo(target)){
        creep.moveTo(target);
    }
}

var raid = function(creep){
	
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
                case TASK_REPAIR:
                    repair(creep,target);
                    break;
                case TASK_REPAIR_WALL:
                    repairWall(creep,target);
                    break;
                case TASK_RECYCLE:
                    recycle(creep,target);
                    break;
                case TASK_RESERVE:
                    reserve(creep,target);
                    break;
			}
		}
	}
}

module.exports.getTarget = getTarget;
