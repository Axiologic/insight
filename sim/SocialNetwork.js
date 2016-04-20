/**
 * Created by salbo on 03/04/2016.
 */
var h = require("../lib/Core.js");

var sim = {
    steps:10,
    maxSimulations:100000,
    minSimulations:100,
    Variables:{
        Casualties:0
    },
    Scenarios:{
        Standard:function(){
            this.People         = 10000000;
            this.UsagePercent   = 0.3;
            this.AtRisk         = 0;
            this.RiskPercent    = 0.1;
        },
        StandardRepeat:function(){
            this.People         = 10000000;
            this.UsagePercent   = 0.3;
            this.AtRisk         = 0;
            this.RiskPercent    = 0.1;
        }
    },
    beforeEachYear:function(){
        if(this.UsagePercent < 0.8){
            this.UsagePercent += 0.1;
        }
        this.AtRisk = Math.floor(this.People * this.UsagePercent * this.RiskPercent);
        this.Casualties = 0;
    },
    eachYear:function(){
        //console.log("Running action for year" , this.currentYear(), this.inDictatorship);
        if(this.inDictatorship){
            this.Casualties += Math.floor(0.01 * this.AtRisk);
        }
    },
    Events: {
        Dictatorship: {
            Description: "Major change in the government. ",
            Belief: 0.4,
            Effect:function(){
                this.inDictatorship = true;
                this.setBelief("Retaliation",0.8);
                this.setBelief("Restoration",0.9);
            }
        },
        Retaliation: {
            Description: "Use of private data to punish disobeying citizens",
            Belief: 0.1,  //it could happen even without Dictatorship
            Effect:function(currentScenario, history){
                this.Casualties +=  Math.floor(0.01 * this.AtRisk);
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
//h.print(res, "Standard");
h.print(res, "Standard", "Casualties");
h.print(res, "StandardRepeat", "Casualties");
