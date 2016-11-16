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

module.exports = {
    mine : function(creep){
        var mycontainer = Game.getObjectById(creep.task.containerId);
        var target = getTarget(creep.task);
        creep.harvest(target);
        if(mycontainer != null){
			creep.moveTo(mycontainer);
        }
		else{
            creep.moveTo(target);
        }
    },

    build : function(creep){
        var target = getTarget(creep.task);
        if(creep.build(target) == OK && creep.carry.energy <= creep.getActiveBodyparts(WORK)*5){ //if building and energy will run out, task is finished
            creep.task = undefined;
        }
        else{
            creep.moveTo(target);
        }
    },

    fill : function(creep){
        var target = getTarget(creep.task);
        if(creep.transfer(target,RESOURCE_ENERGY) == OK){
            creep.task = undefined;
        }
        else{
            creep.moveTo(target);
        }
    },

    pickup : function(creep){
        var target = getTarget(creep.task);
        if(creep.pickup(target) == OK){
            creep.task = undefined;
        }
        else{
            creep.moveTo(target);
        }
    },

    getEnergy : function(creep){
        var target = getTarget(creep.task);
        if(creep.withdraw(target,RESOURCE_ENERGY) == OK){
            creep.task = undefined;
        }
        else{
            creep.moveTo(target);
        }
    },

    upgrade : function(creep){
        var target = getTarget(creep.task);
        if(creep.build(target) == OK && creep.carry.energy <= creep.getActiveBodyparts(WORK)){ //if upgrading and energy will run out, task is finished
            creep.task = undefined;
        }
        else{
            creep.moveTo(target);
        }
    }

}

module.exports.getTarget = getTarget;
