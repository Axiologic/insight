# insight

Create INSIGHT scripts to create  Statistical models for future events. This method is good to quickly obtain estimations for the efects of some future events (scenarios) or to compare two different solutions for a given problem.

For example, we show bellow a very simple simulation script about the effects of choosing a centralised or a descentralised software architecture . After running this simulation in a big number of possible cases we can compare the number of Harmed people in both scenarios:

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

    
    The results could be something like:
    
    Estimated total number of causalities in Centralised case: 197235.61
    Scenario  Centralised on dimension Harmed  Obtained in 100000 simulations
              Years:        2016       2017       2018       2019       2020       2021       2022       2023       2024       2025
             Harmed:           0   11183.31   10213.21    11611.6   15404.21   17309.01   19708.89   26706.09   35699.41   49399.88
    
    Estimated total number of causalities in Decentralised case: 98047.93
    Scenario  Decentralised on dimension Harmed  Obtained in 100000 simulations
              Years:        2016       2017       2018       2019       2020       2021       2022       2023       2024       2025
             Harmed:           0    5178.56    5429.21    7045.56       7378    8462.13    9955.84   13213.96   16786.42   24598.25
    



