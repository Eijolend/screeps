const TASK_EMPTY = 'empty';
const TASK_FILL_MINERAL = 'fillMineral';

module.exports = {
    getTask: function(creep){
        var orders = creep.room.memory.labManager.orders;
        var order = {};
        if(orders){order = orders[0]};
        var labs = [];
        for(lab of creep.room.memory.labManager.labs){
            labs.push(Game.getObjectById(lab.id));
        }
        if(labs[0].mineralType && labs[0].mineralType != creep.room.memory.labManager.labs[0].type){
            creep.memory.task = {type: TASK_EMPTY, id: labs[0].id};
            return OK;
        }
        if(labs[1].mineralType && labs[1].mineralType != creep.room.memory.labManager.labs[1].type){
            creep.memory.task = {type: TASK_EMPTY, id: labs[1].id};
            return OK;
        }
        if(labs[2].mineralType && labs[2].mineralType != creep.room.memory.labManager.labs[2].type){
            creep.memory.task = {type: TASK_EMPTY, id: labs[2].id};
            return OK;
        }
        if(labs[2].mineralAmount >= 1000){
            creep.memory.task = {type: TASK_EMPTY, id: labs[2].id};
            return OK;
        }
        if(order){
            if(labs[0].mineralAmount <= labs[1].mineralAmount && labs[0].mineralAmount < 1000){
                var amount = order.amount - labs[0].mineralAmount
                if(amount > 0){
                    creep.memory.task = {type: TASK_FILL_MINERAL, id:labs[0].id, "amount" : amount, mineralType : order.input1}
                    return OK;
                }
            }
            else if(labs[1].mineralAmount < 1000){
                var amount = order.amount - labs[1].mineralAmount
                if(amount > 0){
                    creep.memory.task = {type: TASK_FILL_MINERAL, id:labs[1].id, "amount" : amount, mineralType : order.input2}
                    return OK;
                }
            }
        }
        creep.memory.task = {type: TASK_EMPTY, id: labs[2].id};
        return OK;
    },

    run: function(creep){
        if(!creep.memory.delivering && _.sum(creep.carry) == creep.carryCapacity){
            creep.memory.delivering = true;
        }
        else if(creep.memory.delivering && _.sum(creep.carry) == 0){
            creep.memory.delivering = false
            if(creep.memory.task.type == TASK_FILL_MINERAL){
                creep.memory.task = undefined;
            }
        }
        if(!creep.memory.task){
            this.getTask(creep);
        }

        if(creep.ticksToLive < 5){
            if(_.sum(creep.carry) > 0){
                creep.transfer(creep.room.terminal,_.findKey(creep.carry,(x) => x > 0));
            }
            else{
                creep.suicide();
            }
            return;
        }

        if(creep.memory.task.type == TASK_EMPTY){
            if(creep.memory.delivering){
                if(creep.transfer(creep.room.terminal,_.findKey(creep.carry,(x) => x > 0)) == ERR_NOT_IN_RANGE){
                    creep.moveTo(creep.room.terminal);
                }
            }
            else{
                var target = Game.getObjectById(creep.memory.task.id);
                if(target.mineralAmount == 0){
                    if(_.sum(creep.carry) > 0){
                        creep.memory.delivering = true;
                    }
                    else{
                        creep.memory.task = undefined;
                    }
                }
                else{
                    if(creep.withdraw(target,target.mineralType) == ERR_NOT_IN_RANGE){
                        creep.moveTo(target);
                    }
                }
            }
        }
        else if(creep.memory.task.type == TASK_FILL_MINERAL){
            if(creep.memory.delivering){
                var target= Game.getObjectById(creep.memory.task.id);
                if(creep.transfer(target,_.findKey(creep.carry,(x) => x > 0)) == ERR_NOT_IN_RANGE){
                    creep.moveTo(target);
                }
            }
            else{
                var amount = creep.memory.task.amount > 50?50:creep.memory.task.amount;
                var retcode = creep.withdraw(creep.room.terminal,creep.memory.task.mineralType,amount);
                if( retcode == ERR_NOT_IN_RANGE){
                    creep.moveTo(creep.room.terminal);
                }
                else if(retcode == OK){
                    creep.memory.delivering = true;
                }
            }
        }
    }
}
