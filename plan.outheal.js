module.exports = {
    start : function(rallyFlag,targetFlag){
        //request appropriate creeps, rally and target are flags for the creep's memory
        healBody = [TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,MOVE];
        Game.rooms['W52S17'].requestCreep(body,undefined,{role : 'planOutheal', rally : rallyFlag, target : targetFlag});
        Game.rooms['W52S17'].requestCreep(body,undefined,{role : 'planOutheal', rally : rallyFlag, target : targetFlag});
        Game.rooms['W52S17'].requestCreep(body,undefined,{role : 'planOutheal', rally : rallyFlag, target : targetFlag});
        Game.rooms['W54S17'].requestCreep(body,undefined,{role : 'planOutheal', rally : rallyFlag, target : targetFlag});
    },
    run : function(creep){
        //logic for creep actions
    }
}
