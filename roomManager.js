"use strict";
const respawn = require('respawn');

var setupTask = function(taskType,object){
    return;
}

var recalcTasks = function(room){
    var taskList = [];
}

module.exports = {
    run : function(room){
        if(Game.time % 20 == 0){
            recalcTasks(room);
        }
        respawn.run(room);
    }
}
