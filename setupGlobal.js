"use strict";

var setupConsts = function(){
	global.ROLE_MINER = "miner";
	global.ROLE_RUNNER = "runner";
	global.ROLE_CIVILIAN = "civilian";
	global.ROLE_RECYCLER = "recycler";
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
}

var setupPrototypes = function(){
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
