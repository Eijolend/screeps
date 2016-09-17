tasks = require('tasks')

module.exports = {
	run : function(creep){
		if (creep.memory.mine != 0 && creep.memory.mine != 1){ //this works only assuming two mines and two miners
			miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
			if(miners[0].memory.mine == 0){
				creep.memory.mine = 1;
			}
			else{
				creep.memory.mine = 0;
			}
		}
		if (creep.carry.energy < creep.carryCapacity){
			var sources = creep.room.find(FIND_SOURCES)
			tasks.mine(creep,sources[creep.memory.mine]);
		}
		else{
			tasks.contain(creep);
		}
	}
}