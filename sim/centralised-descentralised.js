/**
 * Created by salbo on 03/04/2016.
 */
var h = require("./Core.js");

var sim = {
    steps:10,
    threshold:0.1,
    Variables:{
        Casualties:0
    },
    Scenarios:{
        Centralised:function(){
            this.People         = 10000000;
            this.RiskPercent    = 0.01;
            this.originalBeliefBreach   = 0.2;
            this.originalBeliefBreachSolved = 0.5;
            this.setBelief("Breach", this.originalBeliefBreach);

        },
        Decentralised:function(){
            this.People         = 10000000;
            this.RiskPercent    = 0.01;
            this.originalBeliefBreach = 0.1;
            this.originalBeliefBreachSolved = 0.8;
            this.setBelief("Breach", this.originalBeliefBreach);
        }
    },
    beforeStep:function(history, currentYear){
        this.AtRisk = this.People * this.RiskPercent;
        this.Casualties = 0;
    },
    step:function(history, currentYear){
        if(this.looseData) {
            this.Casualties += 0.1 * this.AtRisk;
        }
    },
    Events: {
        Breach: {
            Description: "Major breach affecting all the data. ",
            Belief: 0,
            Effect:function(currentScenario, history){
                this.looseData = true;
                this.setBelief("BreachSolved",this.originalBeliefBreachSolved);
            }
        },
        BreachSolved: {
            Description: "Breach detected and solved",
            Belief: 0,
            Effect:function(currentScenario, history){
                this.looseData = false;
                this.setBelief("Breach",this.originalBeliefBreach);
            }
        }
    }
};

var res = h.run(sim);
h.print(res, "Casualties");