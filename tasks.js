module.exports = {
	mine : function(creep,target){
		if(creep.harvest(target) == ERR_NOT_IN_RANGE ){
			creep.moveTo(target);
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
	
	getenergy : function(creep,mysource){ //get energy in priority: dropped, container, storage, harvest
		var mycontainer = mysource.pos.findInRange(FIND_STRUCTURES,3,{filter : (s) => s.structureType == STRUCTURE_CONTAINER})[0];
		var stock = creep.room.find(FIND_STRUCTURES,{filter : (s) => s.structureType == STRUCTURE_STORAGE && s.store.energy > 0});
		
		var targets = mysource.pos.findInRange(FIND_DROPPED_ENERGY,3);
		if (mycontainer != undefined && mycontainer.store.energy == mycontainer.storeCapacity){ //fixes container overflowing
			this.get(creep,mycontainer);
		}
		else if (targets.length){
			this.pick(creep,targets[0]);
		}
		else if(mycontainer != undefined && mycontainer.store.energy >= creep.carryCapacity){
			this.get(creep,mycontainer);
		}
		else if(stock.length){
			this.get(creep,stock[0]);
		}
		else if(creep.getActiveBodyparts(WORK)){
			this.mine(creep,mysource);
		}
	},
	
	fill : function(creep,prioritylist){
		for(i=0; i<prioritylist.length; i++){
		    if(prioritylist[i]==STRUCTURE_CONTAINER || prioritylist[i]==STRUCTURE_STORAGE){
		        var target=creep.room.find(FIND_STRUCTURES, {
				    filter : (s) => s.structureType == prioritylist[i] && (s.store.energy<s.storeCapacity)
			    })[0];
		    }
		    else{
    			var target=creep.pos.findClosestByRange(FIND_STRUCTURES, {
    				filter : (s) => s.structureType == prioritylist[i] && (s.energy < s.energyCapacity)
    			});
		    }
    		if(target != null){
				if(creep.transfer(target,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
					creep.moveTo(target);
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

	repWall : function(creep){
		var target = creep.pos.findClosestByRange(FIND_STRUCTURES,{filter : (s) => (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) && s.hits < creep.room.memory.wallMax});
		if(target != null){
			if(creep.repair(target) == ERR_NOT_IN_RANGE){
				creep.moveTo(target);
			}
		}
		else if(creep.memory.role = 'repairer'){
			var targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
			this.construct(creep,targets[0]);
		}
	},
	
	rep : function(creep){
		var target=creep.pos.findClosestByRange(FIND_STRUCTURES, {filter : (structure) => (
			structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART && structure.hits < structure.hitsMax)
		});
		if(target != null){
			if(creep.repair(target) == ERR_NOT_IN_RANGE){
				creep.moveTo(target);
			}
		}
		else{
			this.repWall(creep)
		}
	},

	recycle : function(creep,spawn){
		if(spawn.recycleCreep(creep) == ERR_NOT_IN_RANGE){
			creep.moveTo(spawn);
		}
	}
	
	
}