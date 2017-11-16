"use strict";

//this module is for code that is only used because of the current, specific situation
//this is nicer than just writing it in main.js and forgetting to take it out again


module.exports = {
	run : function(){
		var sendrooms = [Game.rooms["W9N58"],Game.rooms["W8N59"],Game.rooms["W6N58"], Game.rooms["W7N56"]];
		var helproom = Game.rooms["E7N57"];
		if(Game.time % 50 ==1){
			for(var room of sendrooms){
				if(_.get(room,"storage.store.energy",0) > 600000 && _.get(room,"terminal.store.energy",0) >= 50000 && _.get(helproom,"terminal.store.energy",0) < 100000){
					room.terminal.send(RESOURCE_ENERGY,25000,helproom.name);
					break; //so only one room sends at a time to avoid stupid cases
				}
			}
		}

		// if(Game.time % 1000 == 0){
		// 	Game.spawns.Spawn1.room.requestCreep([TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE],undefined,{role:ROLE_RAIDER , myflag:"blockade", raidMode:"guard"});
		// 	Game.spawns.Spawn1.room.requestCreep([TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE],undefined,{role:ROLE_RAIDER , myflag:"blockade", raidMode:"guard"});
		// }
	}
}
