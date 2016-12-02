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
                    if(labs[0].pos.isNearTo(mypos) && labs[1].pos.isNearTo(mypos) && labs[2].pos.isNearTo(mypos)){
                        room.memory.labManager.pos = mypos;
                        return OK;
                    }
                }
            }
        }
    },

    addOrder : function(input1,idnput2,output,amount,roomName){
        var room = Game.rooms[roomName];
        if(room.memory.labManager == undefined){
            this.init(room);
        }
        if(room.memory.labManager.orders == undefined){
            room.memory.labManager.orders = [];
        }
        room.memory.labManager.orders.push({'input1': input1, 'input2':input2, 'output':output, 'amount': amount, 'roomName':roomName});
    }//,

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
