"use strict";

var cost = function(body){
	var mycost = 0;
	for(var bodypart of body){
		mycost += BODYPART_COST[bodypart]
	}
	return mycost
}


module.exports = {
	run : function(room){
		
	}
}
