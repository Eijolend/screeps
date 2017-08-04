"use strict";

module.exports = {
	run : function(room){
		if(!room.memory.underAttack){
			var hostiles = room.find(FIND_HOSTILE_CREEPS,{filter: (c) => !_.contains(playerWhiteList,c.owner.username) }).length;
			if(hostiles > 0){
				room.memory.underAttack = true;
			}
		}
		else if(Game.time % 50 == 0){
			var hostiles = room.find(FIND_HOSTILE_CREEPS,{filter: (c) => !_.contains(playerWhiteList,c.owner.username) }).length;
			if(hostiles == 0){
				room.memory.underAttack = false;
			}
		}

		var towers = room.find(FIND_STRUCTURES, {filter: (structure) => structure.structureType == STRUCTURE_TOWER});
		if(towers.length){
			for(var i=0;i<towers.length;i++){
				var tower = towers[i];
				tower.attack(tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS,{filter: (c) => !_.contains(playerWhiteList,c.owner.username)}));
				if(tower.energy > 800){
					tower.repair(tower.pos.findClosestByRange(FIND_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_RAMPART && s.hits < 5000}));
					// tower.repair(tower.pos.findClosestByRange(FIND_STRUCTURES, {filter : (structure) => (
						// structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART && structure.hits < structure.hitsMax) || (
						// (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART) && structure.hits < 5000)
					   // })
					// );
				}
			}
		}
	}
}
