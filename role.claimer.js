 /*
  * very similar to role.reserver
  */

module.exports = {
	run : function(creep){
		var closeto = creep.pos.inRangeTo(Game.flags[creep.memory.myflag],4);
		if(closeto){
			var con = _.filter(Game.flags[creep.memory.myflag].pos.lookFor(LOOK_STRUCTURES),(s) => s.structureType == STRUCTURE_CONTROLLER)[0];
			if (creep.claimController(con) == ERR_NOT_IN_RANGE){
				creep.moveTo(con);
			}
		}
		else{
			creep.moveTo(Game.flags[creep.memory.myflag],{reusePath:25});
		}
	}
}
