module.exports = {
    run : function(creep){
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
                target=myflag.pos.findClosestByRange(FIND_HOSTILE_CREEPS,{filter: (c) => !_.contains(playerWhiteList,c.owner.username)});
            }
            if(target==undefined){
            	target=myflag.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES,{filter:(s) => s.structureType != STRUCTURE_ROAD && s.structureType != STRUCTURE_CONTROLLER && !_.contains(playerWhiteList,s.owner.username)});
            }
            if(target==undefined){
                creep.moveTo(myflag,{reusePath:0});
            }
            if(creep.attack(target) == ERR_NOT_IN_RANGE){
                creep.moveTo(target,{reusePath:0});
            }
        }
        else{
            var wayPoint = Game.flags[creep.memory.waypoint];
            if(wayPoint != undefined){
                if(creep.pos == wayPoint.pos){
                    delete creep.memory.waypoint;
                }
                creep.moveTo(wayPoint);
            }
            else{
                creep.moveTo(myflag);
            }
        }
    }
}
