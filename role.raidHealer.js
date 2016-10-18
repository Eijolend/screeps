module.exports = {
    run : function(creep){
        if(creep.room.name==Game.flags['Raid'].pos.roomName){
            var damaged = _.sortBy(creep.pos.findInRange(FIND_MY_CREEPS,1,{filter: (c) => c.hits < c.hitsMax}),'hits');
            if(damaged.length){
                creep.heal(damaged[0]);
            }
            else{
                var damagedAtRange = _.sortBy(creep.pos.findInRange(FIND_MY_CREEPS,3,{filter: (c) => c.hits < c.hitsMax}),'hits');
                if(damagedAtRange.length){
                    creep.rangedHeal(damagedAtRange[0]);
                }
            }
            var closestRaider = creep.pos.findClosestByRange(FIND_MY_CREEPS,{filter: (c) => c.memory.role == 'raider'});
            if(closestRaider != undefined){
                creep.moveTo(closestRaider,{reusePath:0});
            }
            else{
                creep.moveTo(Game.flags['Raid'],{reusePath:0});
            }
        }
        else{
            creep.moveTo(Game.flags['Raid']);
        }
    }
}
