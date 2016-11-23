module.exports = {
    setupSell : function(resourceType,amount,roomName){
        if(Memory.marketManager == undefined){
            Memory.marketManager = [];
        }
        if(Memory.marketManager)
        Memory.marketManager.push({'resourceType' : resourceType, 'amount' : amount, 'roomName' : roomName});
    },

    handleOverflow : function(terminal){
        var terminals = _.filter(Game.structures, (s) => s.structureType == STRUCTURE_TERMINAL);
        for(terminal of terminals){
            var overflow = _.sum(terminal.store) - terminal.store.energy - 200000;
            if(overflow > 0){
                var maxResource = _.max(_.keys(terminal.store), (k) => terminal.store[k]);
                this.setupSell(maxResource, overflow, terminal.room.name);
            }
        }
    },

    run : function(){
        if(Memory.marketManager && Memory.marketManager[0] != undefined){
            var myTransfer = Memory.marketManager.shift();
            var deals = Game.market.getAllOrders((x) => x.type == ORDER_BUY && x.resourceType == myTransfer.resourceType && x.amount > 100);
            var dealByPrice = _.groupBy(deals,'price');
            deals = dealByPrice[_.max(_.keys(dealByPrice))];
            var myDeal = deals[_.min(_.keys(deals), (k) => Game.market.calcTransactionCost(100,deals[k].roomName,myTransfer.roomName))];
            var maxAmount = Math.floor(Game.rooms[myTransfer.roomName].terminal.store.energy * 100/Game.market.calcTransactionCost(100,myDeal.roomName,myTransfer.roomName));
            var amount = Math.min(myDeal.amount, myTransfer.amount, maxAmount);
            if(Game.market.deal(myDeal.id,amount,myTransfer.roomName) == OK){
                myTransfer.amount -= amount;
            }
            if(myTransfer.amount > 0){
                Memory.marketManager.push(myTransfer);
            }
        }
        else if(Game.time % 500 == 0){
            this.handleOverflow();
        }
    }


}
