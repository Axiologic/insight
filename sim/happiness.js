/**
 * Created by salbo on 03/04/2016.
 */
var h = require("../bin/Core.js");

var sim = {
    steps:10,
    Start:{
        People:7000000000,
        Happiness:0.900,
        Casualties:0
    },
    Scenarios:{
        Optimistic:function(){
            this.setProbability("Manipulation",0.3, 10);
            this.setProbability("AvoidCatastrophe",0.2, 10);
        },
        Pessimistic:function(){
            this.increaseProbability('Manipulation', 0.1, 10); //make it more probable
            this.decreaseProbability('AvoidCatastrophe', 0.05, 10); //make it less probable
        }
    },
    stepActions:function(history, currentYear){
        //nothing but could change probabilities, set variables,etc...
    },
    Events: {
        thisArticle: {
            Description: "Inventarea unei metode de analiza a efectelor tehnologiei asupra fericirii",
            Years: 1,
            Probability: 1,
            Effect: function(){

            }
        },
        Manipulation: {
            Description: "Manipulare sociala prin folosirea metodei",
            Years: 10,
            Probability: 0.9,
            Effect:function(currentScenario, history){
                this.setVar('Happiness', 0.7);
                this.increaseProbability('AvoidCatastrophe', 0.3, 5); //make it more probable
                this.increaseProbability('Catastrophe', 0.3, 5); //make it more probable
            }
        },
        AvoidCatastrophe: {
            Description: "Folosirea pe scara larga si evitarea unor evenimente catastrofale datorita metodei",
            Years: 10,
            Probability: 0.3,
            Effect:function(currentScenario){
            }
        },
        Catastrophe: {
            Description: "Catastrophe",
            Years: 20,
            Probability: 0.6,
            Effect:function(currentScenario){
                this.setVar('Happiness', 0.80);
                this.setVar("Casualties", 0.0001 * this.getVar("People"));
            }
        }
    }
};

var res = h.run(sim);
h.print(res, "Happiness");
h.print(res, "People");
h.print(res, "Casualties");