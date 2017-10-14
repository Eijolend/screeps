"use strict";

const expansionManager = require("expansionManager");
const labManager = require("labManager");

var getTarget = function(task){
    var myobject = Game.getObjectById(task.id);
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

var mineMineral = function(creep,target){
	if(target.mineralAmount == 0){
		creep.role = ROLE_RECYCLER;
		return;
	}
	mine(creep,target);
}

var build = function(creep,target){
	creep.build(target);
	if(!creep.pos.inRangeTo(target,3)){
		creep.moveTo(target);
	}
}

var fill = function(creep,target){
    var resourceType = creep.task.resourceType == undefined ? RESOURCE_ENERGY : creep.task.resourceType;
    var status = creep.transfer(target,resourceType);
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
	var status = creep.withdraw(target,RESOURCE_ENERGY);
	if(status == OK || status == ERR_NOT_ENOUGH_RESOURCES){
		creep.task = undefined;
	}
	if(!creep.pos.isNearTo(target)){
		creep.moveTo(target);
	}
}

var get = function(creep,target){
    var resourceType = creep.task.resourceType == undefined ? RESOURCE_ENERGY : creep.task.resourceType;
    var status = creep.withdraw(target,resourceType);
	if(status == OK || status == ERR_NOT_ENOUGH_RESOURCES){
		creep.task = undefined;
	}
	if(!creep.pos.isNearTo(target)){
		creep.moveTo(target);
	}
}

var upgrade = function(creep,target){
	creep.upgradeController(target);
    var myContainer = Game.getObjectById(_.get(creep, "task.containerId", undefined))
    if(myContainer != null){
        creep.moveTo(myContainer);
        if(creep.carry.energy <=30){
            creep.withdraw(myContainer,RESOURCE_ENERGY);
            if(creep.carryCapacity > myContainer.store.energy){
                _.set(creep.room.memory,"roomManager.lastUpdated."+TASK_FILL,undefined);
            }
        }
    }
	else if(!creep.pos.inRangeTo(target,3)){
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
	var myflag = Game.flags[creep.memory.myflag];
    if(myflag == undefined){
        myflag = Game.flags['Raid'];
    }
    if(creep.room.name==myflag.pos.roomName){
        var targets= _.filter(myflag.pos.lookFor(LOOK_STRUCTURES),(s) => s.structureType != STRUCTURE_ROAD && s.structureType != STRUCTURE_CONTROLLER);
        var target = undefined;
        if (targets.length){
            target=targets[0]
        }
        else{
            target=creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS,{filter: (c) => !_.contains(playerWhiteList,c.owner.username)});
        }
        if(target==undefined){
        	target=myflag.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES,{filter:(s) => s.structureType != STRUCTURE_ROAD && s.structureType != STRUCTURE_CONTROLLER && s.structureType != STRUCTURE_RAMPART && !_.contains(playerWhiteList,s.owner.username)});
        }
        if(target==undefined){
            creep.moveTo(myflag,{reusePath:0});
        }
        creep.attack(target);
        creep.moveTo(target,{reusePath:0});
        //if(creep.attack(target) == ERR_NOT_IN_RANGE){
        //    creep.moveTo(target,{reusePath:0});
        //}
    }
    else{
        creep.moveTo(myflag);
	}
}

var guard = function(creep){ //like raid, but with a maximal engagement range
	var myflag = Game.flags[creep.memory.myflag];
    if(myflag == undefined){
        myflag = Game.flags['Raid'];
    }
	var maxRange = creep.memory.maxRange || 10;
    if(creep.room.name==myflag.pos.roomName){
        var targets= _.filter(myflag.pos.lookFor(LOOK_STRUCTURES),(s) => s.structureType != STRUCTURE_ROAD && s.structureType != STRUCTURE_CONTROLLER);
        var target = undefined;
        if (targets.length){
            target=targets[0]
        }
        else{
            target=creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS,{filter: (c) => !_.contains(playerWhiteList,c.owner.username && c.pos.inRangeTo(myflag,maxRange))});
        }
        if(target==undefined){
        	target=myflag.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES,{filter:(s) => s.structureType != STRUCTURE_ROAD && s.structureType != STRUCTURE_CONTROLLER && s.structureType != STRUCTURE_RAMPART && !_.contains(playerWhiteList,s.owner.username) && s.pos.inRangeTo(myflag,maxRange)});
        }
        if(target==undefined){
            creep.moveTo(myflag,{reusePath:0});
        }
        creep.attack(target);
        creep.moveTo(target,{reusePath:0});
        //if(creep.attack(target) == ERR_NOT_IN_RANGE){
        //    creep.moveTo(target,{reusePath:0});
        //}
    }
    else{
        creep.moveTo(myflag);
	}
}

var hunt = function(creep,controller){
	var target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS,{filter: (c) => !_.contains(playerWhiteList,c.owner.username)});
	if(target != undefined && creep.pos.inRangeTo(target,3)){
		creep.rangedAttack(target);
	}
	if (creep.attack(target) == ERR_NOT_IN_RANGE){
		creep.moveTo(target);
	}
	if(target === null){
		if(creep.room.name == creep.task.roomName){
			creep.task = undefined;
		}
		creep.moveTo(controller); //either moves to relevant room, or prevents being stuck at edges.
	}
}

var scout = function(creep,target){
	creep.moveTo(target);
	if(creep.room.name == creep.task.roomName){
		var status = expansionManager.remoteUpdate(creep.room.name, creep.memory.homeRoom);
		if(status == OK){
			creep.role = ROLE_RECYCLER;
			creep.task = undefined;
		}
	}
}

var remoteMine = function(creep,target){
	if(creep.memory.workable && creep.carry.energy == 0) {
        creep.memory.workable = false;
    }
    if(!creep.memory.workable && creep.carry.energy == creep.carryCapacity) {
        creep.memory.workable = true;
	}

	if(creep.room.name == creep.task.roomName){
		if(creep.memory.workable){
			var myContainer = Game.getObjectById(creep.task.containerId);
			if (myContainer == null){
				myContainer = target.pos.findInRange(FIND_STRUCTURES,1,{filter: (s) => s.structureType == STRUCTURE_CONTAINER})[0];
			}
			if(myContainer == undefined){
				var csContainer = target.pos.findInRange(FIND_CONSTRUCTION_SITES,1,{filter:(s) => s.structureType == STRUCTURE_CONTAINER});
				if(csContainer.length == 0){
                    creep.pos.createConstructionSite(STRUCTURE_CONTAINER);
                }
				else{
					build(creep,csContainer[0]);
				}
			}
			else if(myContainer.hits < myContainer.hitsMax){
        		creep.repair(myContainer);
				if(!creep.pos.isNearTo(target)){
					creep.moveTo(target);
				}
			}
			else{
				if(!creep.task.containerId){
					creep.task.containerId = myContainer.id;
				}
				mine(creep,target);
			}
		}
		else{
			mine(creep,target);
			if(!creep.memory.atGoal && creep.pos.inRangeTo(target,2)){
                creep.memory.atGoal = true;
                creep.memory.travelTime = 1500 - creep.ticksToLive;
			}
		}
	}
	else{
		creep.moveTo(target);
	}
}

var remoteGetEnergy = function(creep,target){
	if(creep.room.name != creep.task.roomName){
		creep.moveTo(target);
	}
	else{
		var dropped = target.pos.findInRange(FIND_DROPPED_RESOURCES,3,{filter: (r) => r.resourceType == RESOURCE_ENERGY});
        var myContainer = target.pos.findInRange(FIND_STRUCTURES,1,{filter: (s) => s.structureType == STRUCTURE_CONTAINER})[0];
		if (myContainer != undefined && myContainer.store.energy == myContainer.storeCapacity){ //fixes container overflowing
			getEnergy(creep,myContainer);
		}
		else if(dropped.length){
			pickup(creep,dropped[0]);
		}
		else if (myContainer != undefined){
			getEnergy(creep,myContainer);
		}
		else{
			creep.moveTo(target,{range:2});
		}
	}
}

var claim = function(creep,target){
	creep.claimController(target);
	if(!creep.pos.isNearTo(target)){
		creep.moveTo(target);
	}
}

var emptyLab = function(creep,lab){
	if(_.sum(creep.carry) > 0){
		creep.task.resourceType = _.findKey(creep.carry,(x) => x > 0);
		fill(creep,creep.room.terminal);
	}
	else if(lab.mineralAmount == 0){
		creep.task = undefined;
	}
	else{
		creep.task.resourceType = lab.mineralType;
		get(creep,lab);
	}
}

var setupLabs = function(creep){
	if(!creep.room.memory.labManager.pos){
        labManager.init(creep.room);
        return;
    }
    var orders = _.get(creep.room.memory,"labManager.orders",[]);
    var order = {};
    if(orders.length >  0){
		order = orders[0]
	}
	else{ //if there are no orders left, orderly leave your workspace
		if(_.sum(creep.carry) > 0){
			creep.task.resourceType = _.findKey(creep.carry,(x) => x > 0);
			fill(creep,creep.room.terminal);
		}
		else{
			creep.role = ROLE_RECYCLER;
		}
		return;
	}

    if(!creep.pos.isEqualTo(creep.room.memory.labManager.pos)){
        creep.moveTo(new RoomPosition(creep.room.memory.labManager.pos.x,creep.room.memory.labManager.pos.y,creep.room.memory.labManager.pos.roomName));
    }
    else if(!creep.carry[order.input1] || creep.carry[order.input1] < Math.min(10,order.amount)){
        creep.withdraw(creep.room.terminal,order.input1, Math.min(10,order.amount));
    }
    else if(!creep.carry[order.input2] || creep.carry[order.input2] < Math.min(5,order.amount)){
        creep.withdraw(creep.room.terminal,order.input2, Math.min(5,order.amount));
    }
    else{
        creep.memory.setup = true;
        creep.task = undefined;
	}
}

var laborant = function(creep){
	var orders = creep.room.memory.labManager.orders;
    var order = {};
    if(orders.length > 0){order = orders[0]};
    if(order.amount <= 0){
        orders.shift();
        creep.memory.task = undefined;
        return;
    }
    var labs = [];
    for(var lab of creep.room.memory.labManager.labs){
        labs.push(Game.getObjectById(lab.id)); //probably could cut some calls here
    }
    const A = order.input1;
    const B = order.input2;
    const C = order.output;
    switch ((Game.time - creep.task.timeStamp) % 10){
        case 0:
            if(creep.ticksToLive < 15){
                creep.task = undefined;
                return;
            }
            creep.withdraw(labs[0],C);
            if( (labs[0].mineralType != undefined && labs[0].mineralType != C) || labs[1].mineralType || labs[2].mineralType){
                creep.task = undefined; //if something went wrong, clean up labs before starting over
                return;
            }
            break;
        case 1:
            creep.transfer(labs[0],A,Math.min(10,order.amount));
            break;
        case 2:
            creep.transfer(labs[1],B,Math.min(5,order.amount));
            break;
        case 3:
            if(labs[2].runReaction(labs[0],labs[1]) == OK){
                order.amount -= 5;
            }
            creep.withdraw(creep.room.terminal,B,Math.min(15,order.amount));
            break;
        case 4:
            creep.withdraw(labs[2],C);
            break;
        case 5:
            creep.transfer(labs[2],B,Math.min(10,order.amount));
            break;
        case 6:
            if(labs[1].runReaction(labs[0],labs[2]) == OK){
                order.amount -= 5;
            }
            creep.withdraw(creep.room.terminal,A,Math.min(15,order.amount));
            break;
        case 7:
            creep.withdraw(labs[1],C);
            break;
        case 8:
            creep.transfer(labs[1],A,Math.min(5,order.amount));
            break;
        case 9:
            if(labs[0].runReaction(labs[1],labs[2]) == OK){
                order.amount -= 5;
            }
            creep.transfer(creep.room.terminal,C);
            break;
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
				case TASK_RAID:
					raid(creep);
					break;
				case TASK_GUARD:
					guard(creep);
					break;
				case TASK_HUNT:
					hunt(creep,target);
					break;
				case TASK_SCOUT:
					scout(creep,target);
					break;
				case TASK_REMOTE_MINE:
					remoteMine(creep,target);
					break;
				case TASK_REMOTE_GET_ENERGY:
					remoteGetEnergy(creep,target);
					break;
				case TASK_CLAIM:
					claim(creep,target);
					break;
				case TASK_MINE_MINERAL:
					mineMineral(creep,target);
					break;
                case TASK_GET:
                    get(creep,target);
                    break;
				case TASK_EMPTY_LAB:
					emptyLab(creep,target);
					break;
				case TASK_SETUP_LABS:
					setupLabs(creep);
					break;
				case TASK_LABORANT:
					laborant(creep);
					break;
			}
		}
	}
}

module.exports.getTarget = getTarget;
