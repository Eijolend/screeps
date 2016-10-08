let tasks = require('tasks');
let respawn = require('respawn');

module.exports = {
	builderTarget : function(room,numCivs){
		var progLeft = _room.find(FIND_MY_CONSTRUCTION_SITES).sumBy( (cs) => cs.progressTotal - cs.progress);
		var energyPerCiv = respawn.bodies.civilian(room.energyCapacityAvailable).length * 50 / 3;
		var buildersNeeded = Math.ceil(progLeft/energyPerCiv); //if no spawn, will return Infinity, but Math.min can handle that
		return Math.min(buildersNeeded,numCivs - 1)
	},
	run : function(creep){
		//preparing
		if(creep.memory.ontask && creep.carry.energy == 0){
			creep.memory.ontask = false;
            creep.say('getting');
		}
		if(!creep.memory.ontask && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.ontask = true;
			creep.memory.mytask = ' ' //remove current task so own task is not counted in the following
			var civs = creep.room.find(FIND_CREEPS,{filter :(c) => c.memory.role == 'civilian'});
			var civsByTask = _.groupBy(civs,'memory.mytask');
			var numBuilders = civsByTask.builder != undefined ? civsByTask.builder.length : 0;
			var numUpgraders= civsByTask.upgrader != undefined ? civsByTask.upgrader.length : 0;
			
			if(numUpgraders != 0 && numBuilders < this.builderTarget(creep.room,civs.length) ){
				creep.memory.mytask = 'builder'
				creep.say('building');
			}
			else{
				creep.memory.mytask = 'upgrader'
				creep.say('upgrading')
			}
	    }
		//doing stuff
		if(creep.memory.ontask && creep.memory.mytask == 'builder'){
			var targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
			if(targets.length){
				tasks.construct(creep,targets[0]);
			}
			else{
				creep.memory.ontask = false //switch back to getting if there is nothing left to build
			}
		}
		else if(creep.memory.ontask && creep.memory.mytask == 'upgrader'){
			if(creep.upgradeController(creep.room.controller)==ERR_NOT_IN_RANGE){
	            creep.moveTo(creep.room.controller);
	        }
		}
		else if(creep.ticksToLive < 100){
			creep.memory.role = 'recycler';
		}
        else{ //get energy in priority: dropped, container, storage, harvest
			var sources = creep.room.find(FIND_SOURCES);
			var mysource = sources[1];
			tasks.getenergy(creep,mysource);
	    }
	}
}