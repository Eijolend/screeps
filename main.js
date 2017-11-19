"use strict";

const creepLoop = require("creepLoop");
const roomManager = require ("roomManager");
const defenseManager = require("defenseManager");
const marketManager = require("marketManager");
const planManager = require("planManager");
const tempcode = require("tempcode");
const profiler = require("screeps-profiler");

require("setupGlobal")(); //global constants and modified prototypes

global.playerWhiteList = [];


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
		var myrooms = _.filter(Game.rooms, (r) => r.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN}).length > 0);
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
			Game.spawns.Spawn1.room.controller.activateSafeMode();
		}

		planManager.run();

		tempcode.run();

	});
}
