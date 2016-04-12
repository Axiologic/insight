/**
 * Created by salbo on 03/04/2016.
 */
var h = require("../bin/Core.js");

var sim = {
    steps:10,
    Variables:{
        Casualties:0
    },
    Scenarios:{
        Standard:function(){
            this.People         = 10000000;
            this.UsagePercent   = 0.3;
            this.AtRisk         = 0;
            this.RiskPercent    = 0.01;
        }
    },
    beforeStep:function(history, currentYear){
        if(this.UsagePercent < 0.8){
            this.UsagePercent += 0.1;
        }
        this.AtRisk = this.People * this.UsagePercent * this.RiskPercent;
        this.Casualties = 0;
    },
    step:function(history, currentYear){
        if(this.inDictatorship){
            this.Casualties += 0.01 * this.AtRisk;
        }
    },
    Events: {
        useOfSocialNetworkX: {
            Description: "Use of the social network",
            Belief: 1,
            recurrent:true,
            Effect: function(){

            }
        },
        Dictatorship: {
            Description: "Major change in the government. ",
            Belief: 0.4,
            Effect:function(currentScenario, history){
                this.inDictatorship = true;
                this.increaseBelief("Retaliation",0.8);
                this.increaseBelief("Restoration",0.9);
            }
        },
        Retaliation: {
            Description: "Use of private data to punish disobeying citizens",
            Belief: 0.1,
            Effect:function(currentScenario, history){
                this.Casualties += 0.1 * this.AtRisk;
            }
        },
        Restoration: {
            Description: "Return to democracy. End of",
            Belief: 0,
            Effect:function(currentScenario){
                this.inDictatorship = false;
            }
        }
    }
};

var res = h.run(sim);
h.print(res, "People");
h.print(res, "Casualties");