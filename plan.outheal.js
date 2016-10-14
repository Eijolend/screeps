module.exports = {
    start : function(rallyFlag,targetFlag){
        //request appropriate creeps, rally and target are flags for the creep's memory
        healBody = [TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,MOVE]; // costs 2280, a rcl 6 room can support 2300
        Game.rooms['W52S17'].requestCreep(healBody,undefined,{role : 'planOutheal', num : 0 });
        Game.rooms['W52S17'].requestCreep(healBody,undefined,{role : 'planOutheal', num : 1 });
        Game.rooms['W52S17'].requestCreep(healBody,undefined,{role : 'planOutheal', num : 2 });
        Game.rooms['W54S17'].requestCreep(healBody,undefined,{role : 'planOutheal', num : 3 });
        Memory.planOutheal = {
            stage : 0,
            rally : rallyFlag,
            target : targetFlag
        }
    },
    staging : function(){
        if (Game.flags[Memory.planOutheal.rally].pos.roomName in Game.rooms ){
            if(Game.flags[Memory.planOutheal.rally].pos.findInRange(FIND_MY_CREEPS,1,{filter : (c) => c.memory.role == 'planOutheal'}).length > 0){
                Memory.planOutheal.stage = 1;
            }
        }
    },
    run : function(creep){
        if(Memory.planOutheal.stage == 0){
            creep.moveTo(Game.flags[Memory.planOutheal.rally]);
        }
        else if(Memory.planOutheal.stage == 1){
            if(creep.room.name == Game.flags[Memory.planOutheal.target].pos.roomName){
                var damaged = _.sortBy(creep.pos.findInRange(FIND_MY_CREEPS,1,{filter : (c) => c.hits < c.hitsMax}),'hits');
                if(damaged.length){
                    creep.heal(damaged[0])
                }
                var flagPos = Game.flags[Memory.planOutheal.target].pos;
                var wishPos = [25,25]
                switch (creep.memory.num){
                    case 0 :
                        wishPos = [flagPos.x,flagPos.y];
                        break;
                    case 1 :
                        wishPos = [flagPos.x - 1,flagPos.y];
                        break;
                    case 2 :
                        wishPos = [flagPos.x,flagPos.y - 1];
                        break;
                    case 3 :
                        wishPos = [flagPos.x - 1,flagPos.y - 1];
                        break;
                }
                creep.moveTo(...wishPos,{reusePath : 0});
            }
            else{
                creep.moveTo(Game.flags[Memory.planOutheal.target],{reusePath : 0});
            }
        }
    }
}
