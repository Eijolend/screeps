"use strict";

module.exports = {
    run : function(creep){
        if(!creep.memory.delivering && _.sum(creep.carry) == creep.carryCapacity){
            creep.memory.delivering = true;
        }
        else if(creep.memory.delivering && _.sum(creep.carry) == 0 && creep.room.name != creep.memory.homeRoom){
            creep.memory.homeRoom = creep.room.name;
            creep.memory.role = "recycler";
            return;
        }

        if(creep.memory.delivering){
            var targetRoom = Game.rooms[creep.memory.targetRoom];
            var target = null;
            if(targetRoom){
                target = targetRoom.storage;
            }
            if(!target){
                creep.memory.role = "recycler";
                return;
            }
            if(creep.pos.isNearTo(target)){
                creep.transfer(target,RESOURCE_ENERGY);
            }
            else{
                creep.moveTo(target);
            }
        }
        else{
            var target = creep.room.storage;
            if(!target){
                creep.memory.role = "recycler";
                return;
            }
            if(creep.pos.isNearTo(target)){
                creep.withdraw(target,RESOURCE_ENERGY);
            }
            else{
                creep.moveTo(target);
            }
        }
    }
}
