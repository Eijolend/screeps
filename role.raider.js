module.exports = {
    run : function(creep){
        if(creep.room.name==Game.flags['Raid'].pos.roomName){
            var targets= _.filter(Game.flags['Raid'].pos.lookFor(LOOK_STRUCTURES),(s) => s.structureType != STRUCTURE_ROAD && s.structureType != STRUCTURE_CONTROLLER);
            var target = undefined;
            if (targets.length){
                target=targets[0]
            }
            else{
                target=Game.flags['Raid'].pos.findClosestByRange(FIND_HOSTILE_CREEPS,{filter: (c) => !_.contains(playerWhiteList,c.owner.username)});
            }
            if(target==undefined){
            	target=Game.flags['Raid'].pos.findClosestByRange(FIND_HOSTILE_STRUCTURES,{filter:(s) => s.structureType != STRUCTURE_ROAD && s.structureType != STRUCTURE_CONTROLLER && !_.contains(playerWhiteList,s.owner.username)});
            }
            if(target==undefined){
                creep.moveTo(Game.flags['Raid'],{reusePath:0});
            }
            if(creep.attack(target) == ERR_NOT_IN_RANGE){
                creep.moveTo(target,{reusePath:0});
            }
        }
        else{
            creep.moveTo(Game.flags['Raid']);
        }
    }
}
