"use strict";

const tasks = require("tasks");
const roleMiner = require('creep.roleMiner');
const roleRunner = require('creep.roleRunner');
const roleCivilian = require('creep.roleCivilian');

module.exports = {
    run : function(creep){
        switch (creep.role){
            case "miner":
                roleMiner.run(creep);
                break;
            case "runner":
                roleRunner.run(creep);
                break;
            case "civilian":
                roleCivilian.run(creep);
                break;
        }
        tasks.run(creep);
    }
}
