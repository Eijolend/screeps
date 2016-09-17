module.exports = {
	mine : function(creep,target){
		if(creep.harvest(target) == ERR_NOT_IN_RANGE ){
			creep.moveTo(target)
		}
	},
	
	contain : function(creep){
		var mycontainer=creep.pos.findInRange(FIND_STRUCTURES,2,{
			filter: (structure) => structure.structureType == STRUCTURE_CONTAINER
		});
		if (mycontainer[0].hits < mycontainer[0].hitsMax){ //maintain my own container
			creep.repair(mycontainer[0]);
		}
		else if (creep.transfer(mycontainer[0],RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
			creep.moveTo(mycontainer[0]);
		}
	},
	
	pick : function(creep,target){
		if(creep.pickup(target) == ERR_NOT_IN_RANGE){
			creep.moveTo(target);
		}
	},
	
	get : function(creep,target){
		if(creep.withdraw(target,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
			creep.moveTo(target);
		}
	},
	
	fill : function(creep,prioritylist){
		for(i=0; i<prioritylist.length; i++){
		    if(prioritylist[i]==STRUCTURE_CONTAINER || prioritylist[i]==STRUCTURE_STORAGE){
		        targets=creep.room.find(FIND_STRUCTURES, {
				    filter : (s) => s.structureType == prioritylist[i] && (s.store.energy<s.storeCapacity)
			    });
		    }
		    else{
    			targets=creep.room.find(FIND_STRUCTURES, {
    				filter : (s) => s.structureType == prioritylist[i] && (s.energy < s.energyCapacity)
    			});
		    }
    		if(targets.length){
				if(creep.transfer(targets[0],RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
					creep.moveTo(targets[0]);
				}
				break
			}
		}
	},
	
	construct : function(creep,target){
		if(creep.build(target)==ERR_NOT_IN_RANGE){
			creep.moveTo(target);
		}
	},
	
	rep : function(creep,wallMax){
		target=creep.pos.findClosestByRange(FIND_STRUCTURES, {filter : (structure) => (
                    structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART && structure.hits < structure.hitsMax) || (
                    (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART) && structure.hits < wallMax)
				});
				if(creep.repair(target) == ERR_NOT_IN_RANGE){
					creep.moveTo(target);
				}
	}
	
	
}