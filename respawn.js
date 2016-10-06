var cost = function(body){
	var mycost = 0;
	for(var bodypart of body){
		mycost += BODYPART_COST[bodypart]
	}
	return mycost
}

var bodies = {
	miner : function(maxEnergy){
		var body=[WORK];
		var minEnergy = cost([WORK,MOVE])
		if(maxEnergy > minEnergy){
			var n = Math.min(Math.floor((maxEnergy - minEnergy)/BODYPART_COST[WORK]),4); //a maximum of 5 WORK parts
			for(i=0; i<n; i++){
				body.push(WORK);
			}
		}
		body.push(MOVE);
		return body
	},
	upgrader : function(maxEnergy){
		var template = [WORK,CARRY,MOVE];
		var intervalEnergy = cost(template);
		var n = Math.floor(maxEnergy/intervalEnergy);
		if(n >= 10){
			n=10
		}
		else if(n>=5){
			n=5
		}
		var body = [];
		for(i=0;i<n;i++){
			body.push(WORK,CARRY,MOVE);
		}
		return body
	},
	builder : function(maxEnergy){
		var template = [WORK,CARRY,MOVE];
		var intervalEnergy = cost(template);
		var n = Math.min(Math.floor(maxEnergy/intervalEnergy),6); //hardcapped at 6
		var body = [];
		for(i=0;i<n;i++){
			body.push(WORK,CARRY,MOVE);
		}
		return body
	},
	repairer : function(maxEnergy){
		return this.builder(maxEnergy);
	},
	runner : function(maxEnergy){
		var template = [CARRY,MOVE];
		var intervalEnergy=cost(template);
		var n = Math.min(Math.floor(maxEnergy/intervalEnergy),10); //currently hardcapped at 10
		var body = [];
		for(i=0;i<n;i++){
			body.push(CARRY,MOVE);
		}
		return body
	}
}

module.exports = {
    run : function(myrooms) {
    	// room based spawning
		for(var room of myrooms){
			var spawn = room.find(FIND_STRUCTURES,{filter : (s) => s.structureType == STRUCTURE_SPAWN && s.spawning != null})[0];
			if(spawn==undefined){
				continue
			}
			var maxEnergy = room.energyCapacityAvailable;
			
			var harvester_target = 2; //harvesters per remote site
			var upgrader_target = Math.min(Math.ceil(20/(bodies.upgrader(maxEnergy).length/3)),4); //should be around 500 energy per 50 ticks 
			var builder_target = 2;
			var repairer_target = 1; //repairer is a builder that prioritises repairing non-wall structures
			var miner_target = 2;
			var runner_target = 2;
			var thief_target = 0;
			var hunter_target = 0;
			
			var hostiles = room.find(FIND_HOSTILE_CREEPS);
			if(hostiles.length){
				hunter_target=Math.ceil(hostiles.length/2)
			}
			
			var upgraders = room.find(FIND_MY_CREEPS,{filter: (creep) => creep.memory.role == 'upgrader'});
			var builders = room.find(FIND_MY_CREEPS,{filter: (creep) => creep.memory.role == 'builder'});
			var repairers = room.find(FIND_MY_CREEPS,{filter: (creep) => creep.memory.role == 'repairer'});
			var miners = room.find(FIND_MY_CREEPS,{filter: (creep) => creep.memory.role == 'miner'});
			var runners = room.find(FIND_MY_CREEPS,{filter: (creep) => creep.memory.role == 'runner'});
			var hunters = room.find(FIND_MY_CREEPS,{filter: (creep) => creep.memory.role == 'hunter'});
			// var thiefs = room.find(FIND_MY_CREEPS,{filter: (creep) => creep.memory.role == 'thief'});
	       // console.log(miners.length + ' ' + runners.length + ' ' + upgraders.length + ' ' + repairers.length)
			
			//first ensure 1 miner, 1 runner, 1 upgrader are always available
			if(miners.length < 1){
				spawn.createCreep(bodies.miner(room.energyAvailable),undefined,{role:'miner'});
			}
			else if(runners.length < 1){
				spawn.createCreep(bodies.runner(room.energyAvailable),undefined,{role:'runner'});
			}
			else if(upgraders.length < 1 && room.controller.ticksToDowngrade < 500){
				spawn.createCreep(bodies.upgrader(room.energyAvailable),undefined,{role:'upgrader'});
			}
			//prioritize first repairer so we have something to build early on
			else if(repairers.length < 1){
				spawn.createCreep(bodies.repairer(room.energyAvailable),undefined,{role:'repairer'});
			}
			//now proceed with the rest in priority order
			else if(miners.length < miner_target){
				spawn.createCreep(bodies.miner(maxEnergy),undefined,{role:'miner'});
			}
			else if(runners.length < runner_target){
				spawn.createCreep(bodies.runner(maxEnergy/2),undefined,{role:'runner'});
			}
			else if(upgraders.length < upgrader_target) {
				spawn.createCreep(bodies.upgrader(maxEnergy),undefined,{role:'upgrader'});
			}
			else if(builders.length < builder_target) {
				spawn.createCreep(bodies.builder(maxEnergy),undefined,{role:'builder'});
			}
			else if(repairers.length < repairer_target) {
				spawn.createCreep(bodies.repairer(maxEnergy),undefined,{role: 'repairer'});
			}
			else if(hunters.length < hunter_target) {
				if (spawn.room.energyAvailable > 600){
					spawn.createCreep([TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,MOVE],undefined,{role: 'hunter'});
				}
			}
			// if(thiefs.length < thief_target) {
				// if (spawn.room.energyAvailable > 600){
					// spawn.createCreep([CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],undefined,{role: 'thief'});
				// }
			// }
		}
		//flag based spawning
		for (var flag in Game.flags){ 
			if(/harvest/.test(flag)){ //see that every remote site has enough harvesters
				var harvesters = _.filter(Game.creeps, (creep) => 
					creep.memory.role == 'harvester' && creep.memory.myflag == flag
				);
				if (harvesters.length < harvester_target){
					Game.spawns['Spawn1'].createCreep([MOVE,CARRY,WORK,MOVE,CARRY,WORK,MOVE,CARRY,WORK,MOVE,CARRY,WORK,MOVE,CARRY,WORK,MOVE,CARRY,WORK,MOVE,CARRY,WORK,MOVE,CARRY,WORK,MOVE,CARRY,WORK,MOVE,CARRY,WORK],undefined,{
						role: 'harvester', myflag: flag, home: Game.spawns['Spawn1'].room.name
					});
				}
			}
			if(/reserve/.test(flag)){ //logic to spawn reservers
				var reservers = _.filter(Game.creeps, (creep) => 
					creep.memory.role == 'reserver' && creep.memory.myflag == flag
				);
				if (reservers.length < 1){
					var tospawn = false
					if (Game.flags[flag].memory.reserved && Game.flags[flag].pos.roomName in Game.rooms){ //second check is to prevent breaking from no vision
						var con = Game.flags[flag].pos.lookFor(LOOK_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_CONTROLLER})[0];
						if(con.reservation == undefined){ //yet more failsafes
							Game.flags[flag].memory.reserved = false;
						}
						else if(con.reservation.ticksToEnd < 500){
							tospawn = true;
						}
					}
					else{
						if(Game.spawns['Spawn1'].canCreateCreep([MOVE,CLAIM,CLAIM,MOVE],undefined,{
								role: 'reserver', myflag: flag}) == OK){
							tospawn = true;
							Game.flags[flag].memory.reserved = true; //should have some kind of check to prevent breaking
						}
					}
					if(tospawn){
						Game.spawns['Spawn1'].createCreep([MOVE,CLAIM,CLAIM,MOVE],undefined,{
							role: 'reserver', myflag: flag
						});
					}
				}
			}
			if(/claim/.test(flag)){ //continously respawn remoteUpgraders to help establish the new room until flag is removed
				var remoteUpgraders = _.filter(Game.creeps,(creep) => 
					creep.memory.role == 'remoteUpgrader' && creep.memory.myflag == flag
				);
				if (remoteUpgraders.length < 1){
					Game.spawns['Spawn1'].createCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],undefined,{
						role : 'remoteUpgrader' , myflag : flag
					});
				}
			}
		}
		
    }
};
