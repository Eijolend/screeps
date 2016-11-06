var utils = require('utils');

module.exports = function(){
    Room.prototype.requestCreep = function(body,name,mem){
    	if(this.memory.requestList === undefined){
    		this.memory.requestList = [];
    	}
    	var mylist = this.memory.requestList;
    	mylist.push([body,name,mem]);
    	this.memory.requestList = mylist;
    };

    Creep.prototype.std_moveTo = Creep.prototype.moveTo;
    Creep.prototype.moveTo = function(target,opts){
    	if(opts === undefined){
    		opts = {};
    	}
    	if(!(target instanceof Creep)){ //these modifications do not make sense for moving targets
    		if(utils.isPosEqual(this.pos,this.memory.lastPos) && this.fatigue == 0){
    			this.memory.stuckCount += 1;
    		}
    		else{
    			this.memory.stuckCount = 0;
    		}
    		this.memory.lastPos = this.pos;
    		if(this.memory.stuckCount > 1){
    			opts.reusePath = 2;
    		}
    		else{
    			opts.reusePath = 50;
    			opts.ignoreCreeps = true;
    		}
    	}
    	var others = this.room.find(FIND_HOSTILE_CREEPS).length;
    	if(others > 0){
    		opts.reusePath = 0;
            opts.ignoreCreeps = false;
    	}

        if(this.memory.waypoint == undefined){
            this.memory.waypoint = []
        }
        var wayPoint = Game.flags[this.memory.waypoint[0]];
        if(wayPoint != undefined){
            if(this.room.name == wayPoint.pos.roomName){
                this.memory.waypoint.shift();
            }
            return this.std_moveTo(wayPoint,opts);
        }
        else{
            return this.std_moveTo(target,opts);
        }
    };

    StructureSpawn.prototype.std_createCreep = StructureSpawn.prototype.createCreep;
    StructureSpawn.prototype.createCreep = function(body,name,mem){
        if(!mem){
            mem = {};
        }
        if(!mem.homeRoom){
            mem.homeRoom = this.room.name;
        }
        return this.std_createCreep(body,name,mem);
    };
}
