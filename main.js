"use strict";

const creepLoop = require("creepLoop");
const roomManager = require ("roomManager");
const defenseManager = require("defenseManager");
const marketManager = require("marketManager");

require("setupGlobal")(); //global constants and modified prototypes

global.playerWhiteList = [];

const profiler = require("screeps-profiler");
profiler.registerObject(creepLoop, "creepLoop");
profiler.registerObject(roomManager, "roomManager");
profiler.registerObject(defenseManager,"defenseManager");
profiler.registerObject(marketManager,"marketManager");

profiler.enable();
module.exports.loop = function(){
	profiler.wrap(function() {
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

		for(var roomName in Game.rooms){
			defenseManager.run(Game.rooms[roomName]);
		}
		var myrooms = _.filter(Game.rooms, (r) => r.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN}).length > 0 || r.memory.remoteRoom == true);
		for(var room of myrooms){
			roomManager.run(room);
		}

		for(var name in Game.creeps){
	  		var creep = Game.creeps[name];
	  		creepLoop.run(creep);
		}

		if(Game.time % 50 == 0){
			marketManager.run();
		}

		if(Game.spawns.Spawn1.hits < Game.spawns.Spawn1.hitsMax){
			startRoom.controller.activateSafeMode();
		}

		// if(Game.time % 1000 == 0){
		// 	Game.spawns.Spawn1.room.requestCreep([TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE],undefined,{role:ROLE_RAIDER , myflag:"blockade", raidMode:"guard"});
		// 	Game.spawns.Spawn1.room.requestCreep([TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE],undefined,{role:ROLE_RAIDER , myflag:"blockade", raidMode:"guard"});
		// }
	});
}
