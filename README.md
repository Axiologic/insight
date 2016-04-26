# insight

Create INSIGHT scripts to create  Statistical models for future events. This method is good to obtain estimations for future scenarios or to compare two different solutions

For example, we could create a very simple simulations about the effects of choosing a centralised or a descentralised software architecture  and we can compare the number of Harmed People:

    var sim = {
        years:10,
        maxSimulations:100000,
        minSimulations:200,
        distribution:"normal",
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
                    var howMany = Math.floor(Math.random()*(this.subsistems -1 ))+1;
                    this.Harmed += howMany * this.harmedPercent *  this.People/this.subsistems;
                    this.setBelief("Breach", this.originalBelief);
                }
            }
        }
    };
    var res = h.run(sim);
    console.log("Estimated total number of causalities in Centralised case:", res.sum("Centralised", "Harmed"));
    h.print(res, "Centralised",     "Harmed");
    console.log("Estimated total number of causalities in Decentralised case:", res.sum("Decentralised", "Harmed"));
    h.print(res, "Decentralised",   "Harmed");
