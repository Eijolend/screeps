"use strict";

const setupTask = require("utils").setupTask;

module.exports = {
	run : function(creep){
		if(!creep.task){
			//this should never happen
			creep.role = ROLE_RECYCLER;
		}
	}
}
