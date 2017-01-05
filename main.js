"use strict";

const roomManager = require('roomManager');
const creepLoop = require('creepLoop');
// const profiler = require('screeps-profiler');

global.playerWhiteList = ['PiratenBraut','PhillipK','CokeJunkie','KaZoiden','WASP103'];

require('setupGlobal')();

// profiler.registerObject(roomManager, 'roomManager');
// profiler.registerObject(roomManager, 'creepLoop');
// profiler.enable();
module.exports.loop = function(){
	//  profiler.wrap(function() {
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
			roomManager.run(room);
		}

		for(var name in Game.creeps){
			var creep = Game.creeps[name];
			creepLoop.run(creep);
		}

	//  });
}
