"use strict";

const utils = require("utils");

var setupConsts = function(){
	global.ROLE_MINER = "miner";
	global.ROLE_RUNNER = "runner";
	global.ROLE_CIVILIAN = "civilian";
	global.ROLE_RECYCLER = "recycler";
	global.ROLE_RAIDER = "raider";
	global.ROLE_HUNTER = "hunter";
	global.ROLE_RESERVER = "reserver";
	global.ROLE_REMOTE_MINER = "remoteMiner";
	global.ROLE_REMOTE_RUNNER = "remoteRunner";
	global.ROLE_SCOUT = "scout";
	global.ROLE_CLAIMER = "claimer";
	global.ROLE_COLONIST = "colonist";
	global.TASK_BUILD = "build";
	global.TASK_MINE = "mine";
	global.TASK_FILL = "fill";
	global.TASK_PICKUP = "pickup";
	global.TASK_GET_ENERGY = "getEnergy";
	global.TASK_UPGRADE = "upgrade";
	global.TASK_REPAIR = "repair";
	global.TASK_REPAIR_WALL = "repairWall";
	global.TASK_RECYCLE = "recycle";
	global.TASK_RESERVE = "reserve";
	global.TASK_RAID = "raid";
	global.TASK_GUARD = "guard";
	global.TASK_HUNT = "hunt";
	global.TASK_REMOTE_MINE = "remoteMine";
	global.TASK_SCOUT = "scout";
	global.TASK_REMOTE_GET_ENERGY = "remoteGetEnergy"
	global.TASK_CLAIM = "claim";
	// global.TASK_COLONIZE = "colonize";
}

var setupPrototypes = function(){
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

	Object.defineProperty(Creep.prototype, 'role', { get: function () { return this.memory.role; } , set: function(x) { this.memory.role = x; } });
    Object.defineProperty(Creep.prototype, 'task', { get: function () { return this.memory.task; } , set: function(x) { this.memory.task = x; } });

	StructureSpawn.prototype.std_createCreep = StructureSpawn.prototype.createCreep;
    StructureSpawn.prototype.createCreep = function(body,name,mem){
        if(!mem){
            mem = {};
        }
        if(!mem.homeRoom){
            mem.homeRoom = this.room.name;
        }
        var returnValue = this.std_createCreep(body,name,mem);
		return returnValue
	};

	//thanks to WASP103 for the following improvements
    RoomPosition.prototype.isNearTo = function(pos) {
        if(pos.pos !== undefined) {
            pos = pos.pos;
        }
        if(this.roomName === pos.roomName || pos.roomName === undefined) {
            return ( ((this.x>pos.x?this.x-pos.x:pos.x-this.x) <2) && ((this.y>pos.y?this.y-pos.y:pos.y-this.y) <2));
        } else return false;
    };//*/
    RoomPosition.prototype.isEqualTo = function(pos) {
        if(pos.pos !== undefined) {
            pos = pos.pos;
        }
        return (pos.x === this.x && pos.y === this.y && pos.roomName === this.roomName);
    };//*/
    RoomPosition.prototype.getRangeTo = function(pos) {
        if(pos.pos !== undefined) {
            pos = pos.pos;
        }
        var dX = (this.x>pos.x?this.x-pos.x:pos.x-this.x);
        var dY = (this.y>pos.y?this.y-pos.y:pos.y-this.y);
        return (dX>dY?dX:dY);
    };//*/
    RoomPosition.prototype.inRangeTo = function(pos,range) {
        if(pos.pos !== undefined) {
            pos = pos.pos;
        }
        if(this.roomName === pos.roomName) {
            return ( (this.x>pos.x?this.x-pos.x:pos.x-this.x) <= range && (this.y>pos.y?this.y-pos.y:pos.y-this.y) <= range);
        } else return false;
	};//*/
}

module.exports = function(){
	setupConsts();
	setupPrototypes();
}
