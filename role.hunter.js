module.exports ={
	run: function(creep){
		var target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
		if (creep.attack(target) == ERR_NOT_IN_RANGE){
			creep.moveTo(target);
		}
		if(target === null){
			creep.memory.role = 'recycler';
		}
	}
}