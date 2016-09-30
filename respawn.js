module.exports = {
    run : function(myrooms) {
    	//room based spawning
		for(i in myrooms){
			var room = Game.rooms[i]
			var spawn = room.find(FIND_STRUCTURES,{filter : (s) => s.structureType == STRUCTURE_SPAWN})[0];
		
			var harvester_target = 2; //harvesters per remote site
			var upgrader_target = 4;
			var builder_target = 2;
			var repairer_target = 1; //repairer is a builder that prioritises repairing non-wall structures
			var miner_target = 2;
			var runner_target = 2;
			var thief_target = 0;
			var hunter_target = 0;
			
			var hostiles = room.find(FIND_HOSTILE_CREEPS)
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
	//        console.log(harvesters.length + ' ' + upgraders.length + ' ' + builders.length)
			
			if(miners.length < miner_target){
				spawn.createCreep([WORK,WORK,WORK,WORK,WORK,MOVE],undefined,{role:'miner'});
			}
			if(runners.length < runner_target){
				spawn.createCreep([CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE],undefined,{role:'runner'});
			}
			if(upgraders.length < upgrader_target) {
				if (spawn.room.energyAvailable < 600 && upgraders.length < 1){
					spawn.createCreep([WORK,CARRY,MOVE],undefined,{role: 'upgrader'});
				}
				else {
					spawn.createCreep([WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],undefined,{role: 'upgrader'});
				}
			}
			if(builders.length < builder_target) {
				if (spawn.room.energyAvailable < 600 && builders.length < 1){
					spawn.createCreep([WORK,CARRY,MOVE],undefined,{role: 'builder'});
				}
				else {
					spawn.createCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE],undefined,{role: 'builder'});
				}
			}
			if(repairers.length < repairer_target) {
					spawn.createCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE],undefined,{role: 'repairer'});
			}
			if(hunters.length < hunter_target) {
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
					Game.spawns['Spawn1'].createCreep([MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY],undefined,{
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
		}
		
    }
};
