const BASEMINERALS = [RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST];

module.exports = {
    init : function(room){
        if(room.memory.labManager == undefined){
            room.memory.labManager = {};
        }
        var labs = room.find(FIND_MY_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_LAB});
        room.memory.labManager.labs = [];
        for(lab of labs){
            room.memory.labManager.labs.push({id:lab.id});
        }
        if(room.terminal && labs.length >= 3){
            var terminal = room.terminal;
            for(dx of [-1,0,1]){
                for(dy of [-1,0,1]){
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
        if(_.findIndex(BASEMINERALS,output) != -1){
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
        // this.addOrder(input1,input2,output,amount,roomName);
        console.log(JSON.stringify({'input1': input1, 'input2':input2, 'output':output, 'amount': amount, 'roomName':roomName}));
    }

    //,

    // run : function(room){
    //     if(room.memory.labManager == undefined){
    //         this.init(room);
    //     }
    //     var orders = room.memory.labManager.orders;
    //     if(orders){
    //         var order = orders[0];
    //         if(order){
    //             room.memory.labManager.labs[0].type = order.input1;
    //             room.memory.labManager.labs[1].type = order.input2;
    //             room.memory.labManager.labs[2].type = order.output;
    //             var labs = [];
    //             for(lab of room.memory.labManager.labs){
    //                 labs.push(Game.getObjectById(lab.id));
    //             }
    //             if(labs[0].mineralType == room.memory.labManager.labs[0].type && labs[1].mineralType == room.memory.labManager.labs[1].type && (labs[2].mineralType == room.memory.labManager.labs[2].type || labs[2].mineralType == undefined)){
    //                 if(labs[2].runReaction(labs[0],labs[1]) == OK){
    //                     order.amount -= 5;
    //                     if(order.amount <= 0){
    //                         orders.shift();
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }
}
