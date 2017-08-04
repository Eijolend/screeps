"use strict";

const tasks = require("tasks");
const roleMiner = require('creep.roleMiner');
const roleRunner = require('creep.roleRunner');
const roleCivilian = require('creep.roleCivilian');
const roleRecycler = require('creep.roleRecycler');
const roleRaider = require('creep.roleRaider');
const roleHunter = require('creep.roleHunter');
const remoteMiner = require("creep.remoteMiner");
const remoteRunner = require("creep.remoteRunner");
const roleReserver = require("creep.roleReserver");
const roleScout = require("creep.roleScout");

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
			case ROLE_RESERVER:
				roleReserver.run(creep);
				break;
			case ROLE_SCOUT:
				roleScout.run(creep);
				break;
			case ROLE_REMOTE_MINER:
				remoteMiner.run(creep);
				break;
			case ROLE_REMOTE_RUNNER:
				remoteRunner.run(creep);
				break;
        }
        tasks.run(creep);
    }
}
