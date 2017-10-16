"use strict";

//this module is for code that is only used because of the current, specific situation
//this is nicer than just writing it in main.js and forgetting to take it out again


module.exports = {
	run : function(){
		var room = Game.spawns.Spawn1.room;
		var helproom = Game.rooms["W2N58"];

		if(Game.time % 50 == 1 && _.get(room,"terminal.store.energy" >= 50000) && _.get(helproom,"terminal.store.energy" < 100000)){
			room.terminal.send(RESOURCE_ENERGY,25000,helproom.name);
		}

		// if(Game.time % 1000 == 0){
		// 	Game.spawns.Spawn1.room.requestCreep([TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE],undefined,{role:ROLE_RAIDER , myflag:"blockade", raidMode:"guard"});
		// 	Game.spawns.Spawn1.room.requestCreep([TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE],undefined,{role:ROLE_RAIDER , myflag:"blockade", raidMode:"guard"});
		// }
	}
}
