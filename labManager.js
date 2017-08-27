"use strict";

const BASEMINERALS = [RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST];

module.exports = {
    init : function(room){
        if(room.memory.labManager == undefined){
            room.memory.labManager = {};
        }
        var labs = room.find(FIND_MY_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_LAB});
        room.memory.labManager.labs = [];
        for(var lab of labs){
            room.memory.labManager.labs.push({id:lab.id});
        }
        if(room.terminal && labs.length >= 3){
            var terminal = room.terminal;
            for(var dx of [-1,0,1]){
                for(var dy of [-1,0,1]){
                    var mypos = {x: terminal.pos.x + dx, y: terminal.pos.y + dy, roomName: room.name};
                    if(labs[0].pos.getRangeTo(mypos) == 1 && labs[1].pos.getRangeTo(mypos) == 1 && labs[2].pos.getRangeTo(mypos) == 1){
                        room.memory.labManager.pos = mypos;
                        return OK;
                    }
                }
            }
        }
    },

    addOrder : function(input1,input2,output,amount,roomName){
        var room = Game.rooms[roomName];
        if(room.memory.labManager == undefined){
            this.init(room);
        }
        if(room.memory.labManager.orders == undefined){
            room.memory.labManager.orders = [];
        }
        room.memory.labManager.orders.push({'input1': input1, 'input2':input2, 'output':output, 'amount': amount, 'roomName':roomName});
    },

    addChain : function(output,amount,roomName){
        if(_.findIndex(BASEMINERALS,(x) => x == output) != -1){
            return;
        }
        var input1;
        var input2;
        for(var i in REACTIONS){
            input2 = _.findKey(REACTIONS[i], (x) => x == output);
            if(input2 != undefined){
                input1 = i;
                break;
            }
        }
        this.addChain(input1,amount,roomName);
        this.addChain(input2,amount,roomName);
        this.addOrder(input1,input2,output,amount,roomName);
    }
}
