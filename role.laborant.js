const TASK_EMPTY = 'empty';
const TASK_SETUP_LAB = 'setup';
const TASK_LABORANT = 'laborant';
const TASK_RETIRE = 'retire';

module.exports = {
    getTask: function(creep){
        if(!creep.room.memory.labManager){
            require('labManager').init(creep.room);
        }
        var orders = creep.room.memory.labManager.orders;
        var order = {};
        if(orders){order = orders[0]};
        if(!(creep.room.memory.labManager.labs.length>=3)){
            require('labManager').init(creep.room);
            return;
        }
        var labs = [];
        for(lab of creep.room.memory.labManager.labs){
            labs.push(Game.getObjectById(lab.id));
        }
        if(creep.ticksToLive < 15){
            creep.memory.task = {type: TASK_RETIRE};
            return OK;
        }
        if(labs[0].mineralType){
            creep.memory.task = {type: TASK_EMPTY, id: labs[0].id};
            return OK;
        }
        if(labs[1].mineralType){
            creep.memory.task = {type: TASK_EMPTY, id: labs[1].id};
            return OK;
        }
        if(labs[2].mineralType){
            creep.memory.task = {type: TASK_EMPTY, id: labs[2].id};
            return OK;
        }
        if(!creep.memory.setup){
            creep.memory.task = {type: TASK_SETUP_LAB};
            return OK;
        }
        creep.memory.task = {type: TASK_LABORANT, timeStamp : Game.time}; //labs could be written in here when multiple blocks
        creep.memory.setup = false;
        return OK;
    },

    run: function(creep){
        if(!creep.memory.task){
            this.getTask(creep);
        }
        if(creep.memory.task.type == TASK_RETIRE){
            if(_.sum(creep.carry) > 0){
                creep.transfer(creep.room.terminal,_.findKey(creep.carry,(x) => x > 0));
            }
            else{
                creep.suicide();
            }
        }

        if(creep.memory.task.type == TASK_LABORANT){
            var orders = creep.room.memory.labManager.orders;
            var order = {};
            if(orders.length > 0){order = orders[0]};
            if(order.amount <= 0){
                orders.shift();
                creep.memory.task = undefined;
                return;
            }
            var labs = [];
            for(lab of creep.room.memory.labManager.labs){
                labs.push(Game.getObjectById(lab.id)); //probably could cut some calls here
            }
            const A = order.input1;
            const B = order.input2;
            const C = order.output;
            switch ((Game.time - creep.memory.task.timeStamp) % 10){
                case 0:
                    if(creep.ticksToLive < 15){
                        creep.memory.task = undefined;
                        return;
                    }
                    creep.withdraw(labs[0],C);
                    if(labs[0].mineralType != C || labs[1].mineralType || labs[2].mineralType){
                        creep.memory.task = undefined;
                        return;
                    }
                    break;
                case 1:
                    creep.transfer(labs[0],A,Math.min(10,order.amount));
                    break;
                case 2:
                    creep.transfer(labs[1],B,Math.min(5,order.amount));
                    break;
                case 3:
                    if(labs[2].runReaction(labs[0],labs[1]) == OK){
                        order.amount -= 5;
                    }
                    creep.withdraw(creep.room.terminal,B,Math.min(15,order.amount));
                    break;
                case 4:
                    creep.withdraw(labs[2],C);
                    break;
                case 5:
                    creep.transfer(labs[2],B,Math.min(10,order.amount));
                    break;
                case 6:
                    if(labs[1].runReaction(labs[0],labs[2]) == OK){
                        order.amount -= 5;
                    }
                    creep.withdraw(creep.room.terminal,A,Math.min(15,order.amount));
                    break;
                case 7:
                    creep.withdraw(labs[1],C);
                    break;
                case 8:
                    creep.transfer(labs[1],A,Math.min(5,order.amount));
                    break;
                case 9:
                    if(labs[0].runReaction(labs[1],labs[2]) == OK){
                        order.amount -= 5;
                    }
                    creep.transfer(creep.room.terminal,C);
                    break;
            }
        }
        else if(creep.memory.task.type == TASK_SETUP_LAB){
            if(!creep.room.memory.labManager.pos){
                require('labManager').init(creep.room);
                return;
            }
            var orders = creep.room.memory.labManager.orders;
            var order = {};
            if(orders.length >  0){order = orders[0]};
            if(!creep.pos.isEqualTo(creep.room.memory.labManager.pos)){
                creep.moveTo(new RoomPosition(creep.room.memory.labManager.pos.x,creep.room.memory.labManager.pos.y,creep.room.memory.labManager.pos.roomName));
            }
            else if(!creep.carry[order.input1] || creep.carry[order.input1] < Math.min(10,order.amount)){
                creep.withdraw(creep.room.terminal,order.input1, Math.min(10,order.amount));
            }
            else if(!creep.carry[order.input2] || creep.carry[order.input2] < Math.min(5,order.amount)){
                creep.withdraw(creep.room.terminal,order.input2, Math.min(5,order.amount));
            }
            else{
                creep.memory.setup = true;
                creep.memory.task = undefined;
            }
        }
        else if(creep.memory.task.type == TASK_EMPTY){
            if(_.sum(creep.carry) > 0){
                if(creep.transfer(creep.room.terminal,_.findKey(creep.carry,(x) => x > 0)) == ERR_NOT_IN_RANGE){
                    creep.moveTo(creep.room.terminal);
                }
            }
            else{
                var target = Game.getObjectById(creep.memory.task.id);
                if(target.mineralAmount == 0){
                    creep.memory.task = undefined;
                }
                else{
                    if(creep.withdraw(target,target.mineralType) == ERR_NOT_IN_RANGE){
                        creep.moveTo(target);
                    }
                }
            }
        }
    }
}
