module.exports ={
	run: function(creep){
		if(creep.room.name == Game.flags[creep.memory.myflag].pos.roomName){
			var target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {filter: (c) => !(c.owner.username in playerWhiteList )});
			if (creep.attack(target) == ERR_NOT_IN_RANGE){
				creep.moveTo(target);
			}
			if(target === null ){
			creep.memory.role = 'recycler';
			}
		}
		else{
			creep.moveTo(Game.flags[creep.memory.myflag]);
		}
	}
}
