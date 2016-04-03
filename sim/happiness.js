/**
 * Created by salbo on 03/04/2016.
 */
var h = require("../bin/core.js");

var sim = {
    steps:10,
    Start:{
        People:7000000000,
        Happiness:0.900
    },
    Scenarios:{
        Optimistic:{
        "Manipulation":-0.05,
        "AvoidCatastrophe":0.1
        },
        Pessimistic:{
        "Manipulation":0.05,
        "AvoidCatastrophe":0.05
        }
    },
    stepAdjust:function(history){
        return this.Happiness;
    },
    Events: {
        thisArticle: {
            Description: "Folosirea unei metode de analiza a efectelor tehnologiei asupra fericirii",
            Years: 1,
            Probability: 1,
            Effect: {
                Optimistic: 0,
                Pessimistic: 0
            }
        },
        Manipulation: {
            Description: "Manipulare sociala prin folosirea metodei",
            Years: 10,
            Probability: 0.1,
            Effect: {
                Optimistic: -0.001,
                Pessimistic: -0.1
            }
        },
        AvoidCatastrophe: {
            Description: "Evitarea unor evenimente catastrofale datorita metodei",
            Years: 10,
            Probability: 0.3,
            Effect: {
                Optimistic: 0.0,
                Pessimistic: 0.0,
                disable: "Catastrophe"
            }
        },
        Catastrophe: {
            Description: "Catastrophe",
            Years: 30,
            Probability: 0.5,
            Effect: {
                Optimistic: -0.1,
                Pessimistic: -0.5
            }
        }
    }
};

var res = h.run(sim);
h.print(res);