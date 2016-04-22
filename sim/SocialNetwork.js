/**
 * Created by salbo on 03/04/2016.
 */
var h = require("../lib/Core.js");

var sim = {
    years:20,
    maxSimulations:10000,
    minSimulations:100,
    distribution:"normal", //"normal/uniform/certainly"
    Variables:{
        annualCausalities:0,
        Casualties:0,
        People:1000000000
    },
    Scenarios:{
        Pessimistic:function(){
            this.UsagePercent   = 0.3;
            this.AtRisk         = 0;
            this.RiskPercent    = 0.3;
            this.setBelief("Dictatorship",0.2);
        },
        Optimistic:function(){
            this.UsagePercent   = 0.3;
            this.AtRisk         = 0;
            this.RiskPercent    = 0.1;
            this.setBelief("Dictatorship",0.1);
        }
    },
    beforeEachYear:function(){
        if(this.UsagePercent < 0.8){
            this.UsagePercent += 0.1;
        }
        this.AtRisk = Math.floor(this.People * this.UsagePercent * this.RiskPercent);
        this.annualCausalities = 0;
    },
    eachYear:function(){
        //console.log("Running action for year" , this.currentYear(), this.inDictatorship);
        if(this.inDictatorship){
            this.annualCausalities += Math.floor(0.01 * this.AtRisk);
        }
        this.Casualties += this.annualCausalities;
    },
    Events: {
        Dictatorship: {
            Description: "Major change in the government. ",
            Belief: 0.4,
            distribution:"normal",
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
                this.annualCausalities +=  Math.floor(0.01 * this.AtRisk);
            }
        },
        Restoration: {
            Description: "Return to democracy. End of",
            Belief: 0,
            Effect:function(currentScenario){
                this.inDictatorship = false;
            }
        },
        identityTheft:{
            Description: "Return to democracy. End of",
            Belief: 0,
            Effect:function(currentScenario){
                this.identityTheftVictims = 0.1 * this.People;
            }
        }
    }
};

var res = h.run(sim);
//h.print(res, "Standard");
console.log("Estimated total number of causalities in Pessimistic case:", res.total("Pessimistic", "annualCausalities"));
h.print(res, "Pessimistic", "Casualties");
h.print(res, "Pessimistic", "annualCausalities");

console.log("Estimated total number of causalities in Optimistic case:", res.total("Optimistic", "annualCausalities"));
h.print(res, "Optimistic", "Casualties");
h.print(res, "Optimistic", "annualCausalities");
