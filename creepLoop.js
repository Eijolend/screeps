"use strict";

const tasks = require("tasks");
const roleMiner = require('creep.roleMiner');
const roleRunner = require('creep.roleRunner');
const roleCivilian = require('creep.roleCivilian');
const roleRecycler = require('creep.roleRecycler');
const roleRaider = require('creep.roleRaider');
const roleHunter = require('creep.roleHunter');

module.exports = {
    run : function(creep){
        if(creep.task && tasks.getTarget(creep.task) == undefined){ //check if target still exists, useful for building and pickup
            creep.task = undefined;
        }
        switch (creep.role){
            case ROLE_MINER:
                roleMiner.run(creep);
                break;
            case ROLE_RUNNER:
                roleRunner.run(creep);
                break;
            case ROLE_CIVILIAN:
                roleCivilian.run(creep);
                break;
            case ROLE_RECYCLER:
                roleRecycler.run(creep);
                break;
			case ROLE_RAIDER:
				roleRaider.run(creep);
				break;
			case ROLE_HUNTER:
				roleHunter.run(creep);
				break;
        }
        tasks.run(creep);
    }
}
