/**
 * Created by salbo on 03/04/2016.
 */
function clone(o){
    var res = {};
    for(var v in o){
        res[v] = o [v];
    }
    return res;
}

exports.run = function(sim){
    var res = {vars:{Happiness:1}}; //perfectly happy by default
    res.series = {};
    res.steps = sim.steps;

    res.stepAdjust = sim.stepAdjust;
    if(!res.stepAdjust){
        res.stepAdjust = function(history){
            return this.Happiness; //keep constant
        }
    }


    res.forks =[];
    for(var v in sim.Scenarios){
        res.series[v] = [];
        res.forks.push(v);
    }

    function runStep(step, fork){
        res.series[fork].push(clone(res.vars));
    }

    res.baseUnhappiness = res.steps* (1- sim.Start.Happiness) * sim.Start.People;

    try{
        res.forks.forEach(function(forkName){
            res.vars = clone(sim.Start);
            for(var i=0;i<sim.steps;i++){
                runStep(i, forkName);
                sim.Happiness = sim.stepAdjust;
            }
        })
    }catch(err){
        console.log("Failure in simulation", err);
    }
    return res;
}

exports.print = function(result){
    console.log("Null Hypothessis:", result.baseUnhappiness, " years of unhappiness during ",result.steps, " years of simulation" );
    console.log(JSON.stringify(result));
}