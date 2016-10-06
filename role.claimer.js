 /*
  * very similar to role.reserver
  */
  
module.exports = {
	run : function(creep){
		var closeto = creep.pos.findInRange(FIND_FLAGS,4,{filter: (f) => f.name == creep.memory.myflag});
		if(closeto.length){
			var con = Game.flags[creep.memory.myflag].pos.lookFor(LOOK_STRUCTURES,{filter : (s) => s.structureType == STRUCTURE_CONTROLLER})[0];
			if (creep.claimController(con) == ERR_NOT_IN_RANGE){
				creep.moveTo(con);
			}
		}
		else{
			creep.moveTo(Game.flags[creep.memory.myflag],{reusePath:25});
		}
	}
}
