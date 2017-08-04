"use strict";

module.exports = {
	run : function(room){
		var towers = room.find(FIND_STRUCTURES, {filter: (structure) => structure.structureType == STRUCTURE_TOWER});
		if(towers.length){
			for(i=0;i<towers.length;i++){
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
