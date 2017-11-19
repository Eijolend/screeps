"use strict";

const planOutheal = require("plan.planOutheal");

module.exports = {
	run: function(){
		if(_.get(Memory, "planManager.activePlan.type", undefined) == "planOutheal"){
			var status = planOutheal.evaluateStatus();
			//clean-up logic if status indicates the plan is finished should go here
		}
	},

	processCreep : function(creep){
		switch (_.get(creep.memory, "plan", undefined)){
			case "planOutheal":
				planOutheal.runCreep(creep);
				break;
		}
	}
}
