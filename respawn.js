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
        var harvester_target = 0;
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
		
        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
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
		if(harvesters.length < harvester_target) {
            if (Game.spawns['Spawn1'].room.energyAvailable < 400 && harvesters.length < 2){
                Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE],undefined,{role: 'harvester'});
            }
            else {
				Game.spawns['Spawn1'].createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE],undefined,{role: 'harvester'});
            }
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
    }
};