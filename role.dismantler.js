/*
 * Currently, dismantler has to be in target room already.
 *
 */

module.exports ={
    run : function(creep){
        var dismantleFlags = creep.room.find(FIND_FLAGS,{filter: (f) => /dismantle/.test(f.name)});
        var numFlags = dismantleFlags.length;
        var target = undefined
        for(i=1,i<=numFlags,i++){
            var myFlag = 'dismantle' + i;
            var structsAtPlace = Game.flags[myFlag].pos.lookFor(LOOK_STRUCTURES);
            if(structsAtPlace.length > 0){
                target = structsAtPlace[0];
                break;
            }
        }
        if(target != undefined){
            if(creep.dismantle(target) == ERR_NOT_IN_RANGE){
                creep.moveTo(target);
            }
        }
    }
}
