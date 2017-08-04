"use strict";

const creepLoop = require("creepLoop");
const respawn = require ("respawn");
const defenseManager = require("defenseManager");

require("setupGlobal")(); //global constants and modified prototypes

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

	var myrooms = _.filter(Game.rooms, (r) => r.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN}).length > 0 || r.memory.remoteRoom == true);
	for(var room of myrooms){
		defenseManager.run(room);
		respawn.run(room);
	}

	for(var name in Game.creeps){
  		var creep = Game.creeps[name];
  		creepLoop.run(creep);
	}

	if(Game.spawns.Spawn1.hits < Game.spawns.Spawn1.hitsMax){
		startRoom.controller.activateSafeMode();
	}
}
