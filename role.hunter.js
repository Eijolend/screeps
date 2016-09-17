module.exports ={
	run: function(creep){
		target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
		if (creep.attack(target) == ERR_NOT_IN_RANGE){
			creep.moveTo(target);
		}
		if(target === null){
			creep.moveTo(Game.spawns['Spawn1']);
		}
	}
}