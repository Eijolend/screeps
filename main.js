"use strict";

const creepLoop = require("creepLoop");
const respawn = require ("respawn");
const defenseManager = require("defenseManager");

require("setupGlobal")(); //global constants and modified prototypes

global.playerWhiteList = [];

module.exports.loop = function(){
	if(Game.time % 500 == 0){ //garbage collect
		for(var i in Memory.creeps) {
        	if(!Game.creeps[i]) {
            	delete Memory.creeps[i];
			}
		}
		for(var i in Memory.flags) {
			if(!Game.flags[i]) {
	        	delete Memory.flags[i];
			}
		}
	}

	for(var room of Game.rooms){
		defenseManager.run(room);
	}
	var myrooms = _.filter(Game.rooms, (r) => r.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN}).length > 0 || r.memory.remoteRoom == true);
	for(var room of myrooms){
		respawn.run(room);
	}

	for(var name in Game.creeps){
  		var creep = Game.creeps[name];
  		creepLoop.run(creep);
	}

	if(Game.spawns.Spawn1.hits < Game.spawns.Spawn1.hitsMax){
		startRoom.controller.activateSafeMode();
	}

	if(Game.time % 1000 == 0){
		Game.spawns.Spawn1.room.requestCreep([TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE],undefined,{role:ROLE_RAIDER , myflag:"blockade", raidMode:"guard"});
		Game.spawns.Spawn1.room.requestCreep([TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE],undefined,{role:ROLE_RAIDER , myflag:"blockade", raidMode:"guard"});
	}
}
