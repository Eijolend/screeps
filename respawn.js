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
	civilian : function(maxEnergy){
		var template = [WORK,CARRY,MOVE];
		var intervalEnergy = cost(template);
		var n = Math.min(Math.floor(maxEnergy/intervalEnergy),10); //hardcapped at 10
		var body = [];
		for(i=0;i<n;i++){
			body.push(WORK,CARRY,MOVE);
		}
		return body
	},
	upgrader : function(maxEnergy){
		return this.civilian(maxEnergy);
	},
	repairer : function(maxEnergy){
		return this.civilian(maxEnergy);
	},
	remoteMiner : function(maxEnergy){
		return [WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE]
	},
	remoteRunner : function(maxEnergy){
		var template = [CARRY,MOVE];
		var intervalEnergy=cost(template);
		var n = Math.min(Math.floor((maxEnergy-150)/intervalEnergy),16); //currently hardcapped at 800 carry
		var body = [WORK,MOVE];
		for(i=0;i<n;i++){
			body.push(CARRY,MOVE);
		}
		return body
	},
	// harvester : function(maxEnergy){
	// 	var template = [WORK,CARRY,MOVE];
	// 	var intervalEnergy = cost(template);
	// 	var n = Math.min(Math.floor(maxEnergy/intervalEnergy),10); //hardcapped at 10
	// 	var body = [];
	// 	for(i=0;i<n;i++){
	// 		body.push(WORK,CARRY,MOVE);
	// 	}
	// 	return body
	// },
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
			var spawn = room.find(FIND_STRUCTURES,{filter : (s) => s.structureType == STRUCTURE_SPAWN && s.spawning == null})[0];
			if(spawn==undefined){
				continue
			}
			var maxEnergy = room.energyCapacityAvailable;

			var upgrader_target = 1; //guarantees one upgrader
			// number of civilians: at least 1, maximally 3, else enough to upgrade ca. 500 per 50 ticks, +1 for every 200k in storage
			let storage = room.find(FIND_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_STORAGE})[0];
			var civilian_target = Math.max(Math.min(Math.ceil(20/(bodies.civilian(maxEnergy).length/3))-1,3),1) + ( storage != undefined ? Math.floor(storage.store.energy/200000) : 0 );
			// var emergencies = room.find(FIND_FLAGS,{filter: (f) => /emergency/.test(f.name)}).length
			// if(emergencies > 0 && storage.store.energy > 100000){ //make sure things get used quickly in an emergency
			// 	civilian_target += 2;
			// }
			var builder_target = 0;
			var repairer_target = 1; //repairer is a builder that prioritises repairing non-wall structures
			var miner_target = 2;
			var runner_target = 2;
			var thief_target = 0;
			var hunter_target = 0;

			var hostiles = room.find(FIND_HOSTILE_CREEPS,{filter: (c) => !_.contains(playerWhiteList,c.owner.username) });
			if(hostiles.length){
				hunter_target=Math.ceil(hostiles.length/2);
			}

			var creepsByRole = _.groupBy(_.filter(Game.creeps,(c) => c.pos.roomName == room.name),'memory.role'); //this also counts spawning creeps
			var upgraders = creepsByRole.upgrader != undefined ? creepsByRole.upgrader : [];
			var civilians = creepsByRole.civilian != undefined ? creepsByRole.civilian : [];
			var repairers = creepsByRole.repairer != undefined ? creepsByRole.repairer : [];
			var miners = creepsByRole.miner != undefined ? creepsByRole.miner : [];
			var runners = creepsByRole.runner != undefined ? creepsByRole.runner : [];
			var hunters = creepsByRole.hunter != undefined ? creepsByRole.hunter : [];
			if(room.memory.requestList === undefined){ //checking this every tick is a waste
				room.memory.requestList = JSON.stringify([]);
			}
			var requestList = JSON.parse(room.memory.requestList);
			// var upgraders = room.find(FIND_MY_CREEPS,{filter: (creep) => creep.memory.role == 'upgrader'});
			// var builders = room.find(FIND_MY_CREEPS,{filter: (creep) => creep.memory.role == 'builder'});
			// var repairers = room.find(FIND_MY_CREEPS,{filter: (creep) => creep.memory.role == 'repairer'});
			// var miners = room.find(FIND_MY_CREEPS,{filter: (creep) => creep.memory.role == 'miner'});
			// var runners = room.find(FIND_MY_CREEPS,{filter: (creep) => creep.memory.role == 'runner'});
			// var hunters = room.find(FIND_MY_CREEPS,{filter: (creep) => creep.memory.role == 'hunter'});
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
			// //prioritize first repairer so we have something to build early on
			// else if(repairers.length < 1){
				// spawn.createCreep(bodies.repairer(room.energyAvailable),undefined,{role:'repairer'});
			// }
			//after essentials are ensured, work on the requestList
			else if(requestList.length > 0){
				if(spawn.canCreateCreep(...requestList[0]) == OK){
					spawn.createCreep(...requestList.shift()) //spawns the first creep in the list and deletes it from the list
					room.memory.requestList = JSON.stringify(requestList);
				}
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
			else if(civilians.length < civilian_target) {
				spawn.createCreep(bodies.civilian(maxEnergy),undefined,{role:'civilian'});
			}
			else if(repairers.length < repairer_target) {
				spawn.createCreep(bodies.repairer(maxEnergy),undefined,{role: 'repairer'});
			}
			else if(hunters.length < hunter_target) {
				if (spawn.room.energyAvailable > 600){
					spawn.createCreep([TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE],undefined,{role: 'hunter'});
				}
			}
			// if(thiefs.length < thief_target) {
				// if (spawn.room.energyAvailable > 600){
					// spawn.createCreep([CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],undefined,{role: 'thief'});
				// }
			// }
			else{
				//flag based spawning with homeRoom
				var remoteMiner_target = 1; //miners per remote site
				var remoteRunner_target = 1; //base value per remote site
				for (var flag of _.filter(Game.flags, (f)=>f.memory.homeRoom == room.name)){
					if(/reserve/.test(flag.name)){
						//defend remote room
						if(flag.pos.roomName in Game.rooms){//check to prevent breaking from no vision
							if(flag.room.find(FIND_HOSTILE_CREEPS,{filter: (c) => !_.contains(playerWhiteList,c.owner.username)}).length){
								flag.memory.underAttack = true;
							}
							else{
								flag.memory.underAttack = false;
							}
						}
						if(flag.memory.underAttack){
							remoteMiner_target = 0;
							remoteRunner_target = 0;
							var remoteHunters = _.filter(Game.creeps, (c) => c.memory.role == 'remoteHunter' && c.memory.myflag == flag.name);
							if(remoteHunters.length < 2){
								spawn.createCreep([TOUGH,MOVE,TOUGH,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE],undefined,{
								role : 'remoteHunter', myflag : flag.name, homeRoom : room.name
								});
							}
						}
						//logic to spawn reservers
						var reservers = _.filter(Game.creeps, (creep) =>
							creep.memory.role == 'reserver' && creep.memory.myflag == flag.name
						);
						if (reservers.length < 1){
							var tospawn = false
							if (flag.memory.reserved && flag.pos.roomName in Game.rooms){ //second check is to prevent breaking from no vision
								var con = _.filter(flag.pos.lookFor(LOOK_STRUCTURES), (s) => s.structureType == STRUCTURE_CONTROLLER)[0];
								if(con.reservation == undefined){ //yet more failsafes
									flag.memory.reserved = false;
								}
								else if(con.reservation.ticksToEnd < 500){
									tospawn = true;
								}
							}
							else{
								if(!flag.memory.reserved && spawn.canCreateCreep([MOVE,CLAIM,CLAIM,MOVE],undefined) == OK){
									tospawn = true;
									flag.memory.reserved = true; //should have some kind of check to prevent breaking
								}
							}
							if(tospawn){
								spawn.createCreep([MOVE,CLAIM,CLAIM,MOVE],undefined,{
									role: 'reserver', myflag: flag.name, homeRoom : room.name
								});
							}
						}
					}
					if(/harvest/.test(flag.name)){ //see that every remote site has enough harvesters
						var remoteMiners = _.filter(Game.creeps, (creep) =>
							creep.memory.role == 'remoteMiner' && creep.memory.myflag == flag.name //should be spawned early, but my check is too stupid
						).length;
						var remoteRunners = _.filter(Game.creeps, (creep) =>
							creep.memory.role == 'remoteRunner' && creep.memory.myflag == flag.name
						).length;
						if (remoteMiners < remoteMiner_target){
							spawn.createCreep(bodies.remoteMiner(maxEnergy),undefined,{
								role: 'remoteMiner', myflag: flag.name, homeRoom: room.name
							});
						}
						else{
							if(flag.pos.roomName in Game.rooms){
								var myContainer = flag.pos.findInRange(FIND_STRUCTURES,1,{filter: (s) => s.structureType == STRUCTURE_CONTAINER})[0];
								if(myContainer != undefined && myContainer.store.energy == myContainer.storeCapacity){
									remoteRunner_target = 2;
								}
							}
							if (remoteRunners < remoteRunner_target){
								spawn.createCreep(bodies.remoteRunner(maxEnergy),undefined,{
									role: 'remoteRunner', myflag: flag.name, homeRoom: room.name
								});
							}
						}
					}
					if(/claim/.test(flag)){ //continously respawn remoteUpgraders to help establish the new room until flag is removed
						var remoteUpgraders = _.filter(Game.creeps,(creep) =>
							creep.memory.role == 'remoteUpgrader' && creep.memory.myflag == flag.name
						);
						if (remoteUpgraders.length < 1){
							spawn.createCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],undefined,{
								role : 'remoteUpgrader' , myflag : flag.name, homeRoom : room.name, waypoint:'waypoint'
							});
						}
					}
				}
			}
		}
    }
};

module.exports.bodies = bodies;
