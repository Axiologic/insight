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

function forEach(obj, f){
    for(var v in obj){
        if(obj.hasOwnProperty(v)){
            f(obj[v], v);
        }
    }
}

Object.defineProperty(Object.prototype,"forEach",{
    enumerable: false,
    writable: false,
    configurable: false,
    value: function(f){
        forEach(this,f);
    }
})

function ForkOfTheUniverse(sim, scenarioName){
    //////////////// initialisation //////////////
    var currentYear = 0;
    var defaultVars = clone(sim.Variables);
    var series = {};
    var steps = sim.steps;
    var self = this;
    var stepActions = sim.step;
    var eventsInYear = {};
    
    if(!stepActions){
        stepActions = function(history, currentYear){
            //nothing by default
        }
    }

    var preStepActions = sim.beforeStep;
    if(!stepActions){
        stepActions = function(history, currentYear){
            //nothing by default
        }
    }
    ////////// END INITIALISATION

    function transformProbabilityInYears(probability, years){
        var result = Math.round(years - (probability * years));
        //do something else here with the result !?
        return result;
    }


    function setEventsProbability(forkName){
        eventsInYear = {};
        if(forkName == "Independent"){
            for(var v in sim.Events) {
                eventsInYear[v] = -1;
            }
            return;
        }

        for(var v in sim.Events){
            var e = sim.Events[v];
            eventsInYear[v] = transformProbabilityInYears(e.Probability, e.Years);
        }
        self.adjust = sim.Scenarios[forkName];
        if(!self.adjust){
            throw new Error("simulator should contain a Scenarios section with a function for each scenario");
        }
        self.adjust();
    }
    
    //////////////// END STOCHASTIC CHOOSING METHOD
    
    this.increaseProbability = function(eventName, value, years){
        eventsInYear[eventName] += transformProbabilityInYears(value , years);
    };

    this.decreaseProbability = function(eventName, value, years){
        eventsInYear[eventName] -= transformProbabilityInYears(value , years);
    };

    this.setBelief = function(eventName, value, years){
        eventsInYear[eventName] = value;
    };

    this.currentScenario = function(){
        return scenarioName;
    };

    this.setVar = function(name, value){
        vars[name] = value;
    };

    this.getVar = function(name){
        return vars[name];
    };


    ///////////////// END OOP SURROGATE 
    
    this.simulate = function(){


    }
}


function simulateScenario(sim, name, maxSimulations, result){
    var simulationCount = 0;
    var currentAverage = [];
    var lastAverage    = null;
    var vars = sim.Variables;
    var threshold = sim.threshold;
    if(!threshold){
        threshold = 0.1;
    }
    //initialisation
    for(var i = 0; i < sim.steps; i++){
        var o = clone(vars);
        currentAverage.push(o)
    }

    function converged(currentAverage, lastAverage){

        if(simulationCount > maxSimulations) {
            return true;
        }
        //console.log(">>>>>>>>>Converged:", currentAverage, lastAverage)

        for(var i = 0; i < currentAverage.length; i++){
            for(var v in vars){
                var diff = lastAverage[i][v] - currentAverage[i][v];
                if(Math.abs(diff) > Math.abs(threshold * lastAverage[i][v])) {
                    return false;
                }
            }
        }
        return true;
    }

    function computeAverage(currentAverage, newValues){

        return currentAverage.map(function(newValues){
            var res = clone(newValues);
            //console.log(vars, res, newValues);
            for(var v in vars){
                //console.log(v, newValues);
                res[v] = (res[v] *  simulationCount + newValues[v])/(simulationCount+1);
            }
            return res;
        })
    }

    do{
        lastAverage = currentAverage;
        simulationCount++;
        var fork = new ForkOfTheUniverse(sim, name);
        currentAverage = computeAverage(lastAverage, fork.simulate());

    } while((!converged(currentAverage, lastAverage)))

    result.Average       = currentAverage;
    result.simulations   = simulationCount;
    return result;
}

function Simulation(sim){
    var finalResult = {};
    this.runAll = function(){
        for(var forkName in sim.Scenarios){
            finalResult[forkName] = {};
            simulateScenario(sim, forkName, sim.maxSimulations, finalResult[forkName])
        }
        finalResult.steps = sim.steps;
        return finalResult;
    };


    this.avg = function(scenario, aspect){



    };

    this.invAvg = function(scenario, aspect, probabilityField){



    };

    finalResult.sum = function(scenario, aspect){
        var sum = 0;
        var s = series[scenario];
        forEach(s, function(i){
            sum+=i[aspect];
        })
        return sum;
    };

    finalResult.getVariable = function(scenarioName,variableName){
        return finalResult[scenarioName].Average.map (function(item){
                return item[variableName];
            });
    }
}


exports.run = function(sim){
    var s = new Simulation(sim);

    try{
        return s.runAll()
    }catch(err){
        console.log("Failure in simulation", err.stack);
    }
};

exports.print = function(result, scenario, varName){
    if(!varName){
        console.log(JSON.stringify(result));
        return;
    }
    console.log("Scenario ", scenario , "on dimension", varName, " Obtained in", result[scenario].simulations, "iterations");
    console.log(exports.csv(result,scenario, varName))
};

exports.csv = function(result, scenarioName, varName, separator){
    if(!separator){
        separator = " ";
    }
    function lpad (padString, length) {
        var pad = "";
        length = length - padString.length;
        for(var i = 0; i < length; i++){
            pad += " ";
        }
        return pad + padString
    }

    function genLine(line){
        var res = lpad(varName, 15) + ":";
        res += separator;
        line.forEach(function(o){
           res += lpad(o.toString(), 11);
        });
        res +="\n";
        return res;
    }

    function genHeader(years){
        var res = lpad("Years", 15) + ":";
        res += separator;
        var date = new Date();
        var year = date.getFullYear();
        for(var v = 0; v < years; v++){
            res += lpad( (year + v).toString(), 11);
        }
        res +="\n";
        return res;
    }

    var res = genHeader(result.steps);
    res += genLine(result.getVariable(scenarioName, varName));

    return res;
};