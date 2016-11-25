const tasks = require('tasks');
const roleRaider = require('role.raider');
const roleRaidHealer = require('role.raidHealer');

module.exports = {
    start : function(rallyFlag, targetFlag, waitFlag){
        var healBody = [TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,MOVE]; // costs 2280, a rcl 6 room can support 2300
        Game.rooms['W61N68'].requestCreep(healBody,undefined,{role : 'planWaitstorm', subrole : 'healer', myflag : targetFlag, num : 0 });
        Game.rooms['W61N68'].requestCreep(healBody,undefined,{role : 'planWaitstorm', subrole : 'healer', myflag : targetFlag, num : 1 });
        Game.rooms['W61N68'].requestCreep(healBody,undefined,{role : 'planWaitstorm', subrole : 'healer', myflag : targetFlag, num : 2 });
        var raidBody = [TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK];
        Game.rooms['W61N68'].requestCreep(raidBody,undefined,{role : 'planWaitstorm', subrole : 'raider', myflag : targetFlag, num : 3});
        Game.rooms['W61N68'].requestCreep(raidBody,undefined,{role : 'planWaitstorm', subrole : 'raider', myflag : targetFlag, num : 4});
        Game.rooms['W63N66'].requestCreep(raidBody,undefined,{role : 'planWaitstorm', subrole : 'raider', myflag : targetFlag, num : 5});
        Game.rooms['W63N66'].requestCreep(raidBody,undefined,{role : 'planWaitstorm', subrole : 'raider', myflag : targetFlag, num : 6});
        Game.rooms['W63N66'].requestCreep(raidBody,undefined,{role : 'planWaitstorm', subrole : 'raider', myflag : targetFlag, num : 7});
        Game.rooms['W63N66'].requestCreep(raidBody,undefined,{role : 'planWaitstorm', subrole : 'raider', myflag : targetFlag, num : 8});
        Game.rooms['W63N66'].requestCreep(raidBody,undefined,{role : 'planWaitstorm', subrole : 'raider', myflag : targetFlag, num : 9});

        Memory.planWaitstorm = {
            stage : 0,
            rally : rallyFlag,
            target : targetFlag,
            wait : waitFlag
        }
    },

    trigger : function(){
        Memory.planWaitstorm.stage += 1;
    },

    run : function(creep){
        if(creep.memory.subrole == 'healer'){
            tasks.heal(creep);
        }
        if(Memory.planWaitstorm.stage == 0){
            creep.moveTo(Game.flags[Memory.planWaitstorm.rally]);
        }
        if(Memory.planWaitstorm.stage == 1){
            if(creep.memory.subrole == 'raider'){
                var target = creep.pos.findInRange(FIND_HOSTILE_CREEPS,1,{filter:(c) => !_.contains(playerWhiteList,c.owner.username)})[0];
                creep.attack(target);
            }
            var flag = Game.flags[Memory.planWaitstorm.wait];
            if(creep.room.name != flag.pos.roomName){
                creep.moveTo(flag);
            }
            else{
                var flagPos = flag.pos;
                var wishPos = [25,25];
                switch (creep.memory.num){
                    case 0 :
                        wishPos = [flagPos.x - 1,flagPos.y];
                        break;
                    case 1 :
                        wishPos = [flagPos.x - 1,flagPos.y + 1];
                        break;
                    case 2 :
                        wishPos = [flagPos.x - 1,flagPos.y - 1];
                        break;
                    case 3 :
                        wishPos = [flagPos.x - 1,flagPos.y - 2];
                        break;
                    case 4 :
                        wishPos = [flagPos.x - 1,flagPos.y + 2];
                        break;
                    case 5 :
                        wishPos = [flagPos.x,flagPos.y];
                        break;
                    case 6 :
                        wishPos = [flagPos.x,flagPos.y + 1];
                        break;
                    case 7 :
                        wishPos = [flagPos.x,flagPos.y - 1];
                        break;
                    case 8 :
                        wishPos = [flagPos.x,flagPos.y - 2];
                        break;
                    case 9 :
                        wishPos = [flagPos.x,flagPos.y + 2];
                        break;
                }
                creep.moveTo(...wishPos,{reusePath : 0});
            }
        }
        if(Memory.planWaitstorm.stage == 2){
            if(creep.memory.subrole == 'healer'){
                roleRaidHealer.run(creep);
            }
            else{
                roleRaider.run(creep);
            }
        }
        if(Memory.planWaitstorm.stage == 3){
            creep.memory.role = 'recycler';
        }
    }
}
