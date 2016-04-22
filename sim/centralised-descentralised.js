/**
 * Created by salbo on 03/04/2016.
 */
var h = require("../lib/Core.js");

var sim = {
    years:10,
    maxSimulations:100000,
    minSimulations:1000,
    threshold:0.00001,
    distribution:"uniform",
    Variables:{
        People:100000000,
        harmedPercent:0.1,
        Harmed:0
    },

    Scenarios:{
        Centralised:function(){
            this.originalBelief = 0.01 ;
            this.subsistems = 1;
            this.setBelief("Breach", this.originalBelief);
        },
        Decentralised:function(){
            this.originalBelief = 0.01;
            this.subsistems = 50;
            this.setBelief("Breach", this.originalBelief);
        }
    },
    beforeEachYear:function(history, currentYear){
        this.Harmed  = 0;
    },
    eachYear:function(history, currentYear){
        this.setBelief("Breach", this.originalBelief);
    },
    Events: {
        Breach: {
            Description: "Major breach affecting all the data. ",
            Effect:function(currentScenario, history){
                if( this.subsistems == 1){
                    this.Harmed += 50 * this.harmedPercent* this.People /50;
                } else {
                    var howMany = Math.floor(Math.random()*49)+1;
                    //console.log(howMany , this.harmedPercent ,  this.People);
                    this.Harmed += howMany * this.harmedPercent *  this.People/50;
                }

            }
        }
    }
};

var res = h.run(sim);
console.log("Estimated total number of causalities in Centralised case:", res.sum("Centralised", "Harmed"));
h.print(res, "Centralised",     "Harmed");
console.log("Estimated total number of causalities in Decentralised case:", res.sum("Decentralised", "Harmed"));
h.print(res, "Decentralised",   "Harmed");