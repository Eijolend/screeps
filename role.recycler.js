var tasks = require('tasks');

module.exports = {
	run : function(creep){
		var spawn = creep.room.find(FIND_STRUCTURES,
			{filter : (s) => s.structureType == STRUCTURE_SPAWN})[0];
		tasks.recycle(creep,spawn);
	}
}