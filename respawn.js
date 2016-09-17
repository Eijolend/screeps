/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('respawn');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    run : function() {
        var harvester_target = 2; //harvesters per remote site
        var upgrader_target = 6;
        var builder_target = 3;
        var miner_target = 2;
        var runner_target = 2;
		var thief_target = 0;
        var hunter_target = 0;
		
		var hostiles = Game.spawns['Spawn1'].room.find(FIND_HOSTILE_CREEPS)
		if(hostiles.length){
			hunter_target=Math.ceil(hostiles.length/2)
		}
		
        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
        var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
        var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
		var runners = _.filter(Game.creeps, (creep) => creep.memory.role == 'runner');
		var hunters = _.filter(Game.creeps, (creep) => creep.memory.role == 'hunter');
		var thiefs = _.filter(Game.creeps, (creep) => creep.memory.role == 'thief');
//        console.log(harvesters.length + ' ' + upgraders.length + ' ' + builders.length)
        
		if(miners.length < miner_target){
			Game.spawns['Spawn1'].createCreep([WORK,WORK,WORK,WORK,WORK,MOVE],undefined,{role:'miner'});
		}
		if(runners.length < runner_target){
			Game.spawns['Spawn1'].createCreep([CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE],undefined,{role:'runner'});
		}
        if(upgraders.length < upgrader_target) {
            if (Game.spawns['Spawn1'].room.energyAvailable < 600 && upgraders.length < 1){
                Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE],undefined,{role: 'upgrader'});
            }
            else {
				Game.spawns['Spawn1'].createCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE],undefined,{role: 'upgrader'});
            }
        }
        if(builders.length < builder_target) {
			if (Game.spawns['Spawn1'].room.energyAvailable < 600 && builders.length < 1){
                Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE],undefined,{role: 'builder'});
            }
            else {
				Game.spawns['Spawn1'].createCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE],undefined,{role: 'builder'});
            }
        }
		if(hunters.length < hunter_target) {
			if (Game.spawns['Spawn1'].room.energyAvailable > 600){
                Game.spawns['Spawn1'].createCreep([TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,MOVE],undefined,{role: 'hunter'});
            }
        }
		if(thiefs.length < thief_target) {
			if (Game.spawns['Spawn1'].room.energyAvailable > 600){
                Game.spawns['Spawn1'].createCreep([CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],undefined,{role: 'thief'});
            }
        }
		
		for (var flag in Game.flags){ 
			if(/harvest/.test(flag){ //see that every remote site has enough harvesters
				var harvesters = _.filter(Game.creeps, (creep) => 
					creep.memory.role == 'harvester' && creep.memory.myflag == flag
				);
				if (harvesters < harvester_target){
					Game.spawns['Spawn1'].createCreep([MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY],undefined,{
						role: 'harvester', myflag: flag, home: Game.spawns['Spawn1'].room.name
					});
				}
			}
			if(/reserve/.test(flag){ //logic to spawn reservers
				var reservers = _.filter(Game.creeps, (creep) => 
					creep.memory.role == 'reserver' && creep.memory.myflag == flag
				);
				if (reservers.length < 1){
					var tospawn = false
					if (Game.flags[flag].memory.reserved){
						var con Game.flags[flag].pos.lookFor(LOOK_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_CONTROLLER})[0];
						if(con.reservation.ticksToEnd < 500){
							tospawn = true;
						}
					}
					else{
						tospawn = true;
						Game.flags[flag].memory.reserved = true;
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