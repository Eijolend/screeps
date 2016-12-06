"use strict";

const tasks = require("tasks");
const roleMiner = require('creep.roleMiner');
const roleRunner = require('creep.roleRunner');
const roleCivilian = require('creep.roleCivilian');
const roleRecycler = require('creep.roleRecycler');

module.exports = {
    run : function(creep){
        if(creep.task && tasks.getTarget(creep.task) == undefined){ //check if target still exists, useful for building and pickup
            creep.task = undefined;
        }
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
            case "recycler":
                roleRecycler.run(creep);
                break;
        }
        tasks.run(creep);
    }
}
