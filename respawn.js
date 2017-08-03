"use strict";

var cost = function(body){
	var mycost = 0;
	for(var bodypart of body){
		mycost += BODYPART_COST[bodypart]
	}
	return mycost
}


var bodies = {
	miner : function(maxEnergy){
		var body=[WORK];
		var minEnergy = cost([WORK,MOVE])
		if(maxEnergy > minEnergy){
			var n = Math.min(Math.floor((maxEnergy - minEnergy)/BODYPART_COST[WORK]),4); //a maximum of 5 WORK parts
			for(i=0; i<n; i++){
				body.push(WORK);
			}
		}
		body.push(MOVE);
		return body
	}
}

module.exports = {
	run : function(room){
		var spawn = room.find(FIND_STRUCTURES,{filter : (s) => s.structureType == STRUCTURE_SPAWN && s.spawning == null})[0];
		if(spawn==undefined){
			return;
		}
		var maxEnergy = room.energyCapacityAvailable;
		let storage = room.storage;

		var miner_target = room.find(FIND_SOURCES).length;

		var creepsByRole = _.groupBy(_.filter(Game.creeps,(c) => c.pos.roomName == room.name),'memory.role'); //this also counts spawning creeps
		var miners = creepsByRole.miner != undefined ? creepsByRole.miner.length : 0;

		var requestList = room.memory.requestList;

		if(miners < 1){
			spawn.createCreep(bodies.miner(room.energyAvailable),undefined,{role:ROLE_MINER});
		}
		else if(miners < miner_target){
			spawn.createCreep(bodies.miner(maxEnergy),undefined,{role:ROLE_MINER});
		}
	}
}
