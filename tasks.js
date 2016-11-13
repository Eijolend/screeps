"use strict";

var getTarget = function(task){
    var myobject = Game.getObjectById(task.id)
    if(myobject != null){
        return myobject;
    }
    if(task.roomName in Game.rooms){
        creep.task = undefined;
        return;
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
        return;
    },

    fill : function(creep){
        return;
    },

    pickup : function(creep){
        return;
    },

    getEnergy : function(creep){
        return;
    },

    upgrade : function(creep){
        return;
    }

}
