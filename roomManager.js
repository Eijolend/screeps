"use strict";
const respawn = require('respawn');

var recalcTasks = function(room){
    return;
}

module.exports = {
    run : function(room){
        if(Game.time % 20 == 0){
            recalcTasks(room);
        }
        respawn.run(room);
    }
}
