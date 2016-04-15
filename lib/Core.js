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


function simulateSimulateScenario(sim, name, maxSimulations, result){
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

        for(var i = 0; i < currentAverage.length(); i++){
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
        var pos = 0;
        return currentAverage.map(function(yearValues){
            var res = clone(yearValues);
            for(var v in vars){
                res[v] = (res[v] *  simulationCount + newValues[pos][v])/(simulationCount+1);
            }
            pos++;
            return res;
        })
    }

    do{
        lastAverage = currentAverage;
        simulationCount++;
        var fork = new ForkOfTheUniverse(sime, name);
        currentAverage = computeMedian(currentAverage, fork.simulate());

    } while((!converged()))

    result.Average       = currentAverage;
    result.simulations  = simulationCount;
    return result;
}

function Simulation(sim){

    this.steps = sim.steps;
    
    var currentSimulationName = "";
    



    var series = {};
    var forks =[];
    series['Independent'] = [];
    if(!sim.Scenarios['Independent']){
        sim.Scenarios['Independent'] = function(){};
    }

    for(var v in sim.Scenarios){
        series[v] = [];
        forks.push(v);
    }

    runStep = function (step, fork){
        var history = series[fork];
        stepActions(history, step, fork);
        series[fork].push(clone(vars));
        for(var v in eventsInYear){
            if(eventsInYear[v] == step){
                //probably it should happen so we make it happen
                console.log(">>>>>>>>>>>>>>>>>>>>Happening", v, " in simulation ", fork)
                self.currentEvent = sim.Events[v].Effect;
                self.currentEvent();
            }
        }
    };


    this.runAll = function(){
        console.log(forks);
        forks.forEach(function(forkName){
            currentSimulationName = forkName;
            var vars = clone(defaultVars);
            setEventsProbability(forkName);

            //console.log("Initial:", forkName, " Years with events:", JSON.stringify(eventsInYear));
            for(currentYear = 0; currentYear < sim.steps; currentYear++){
                runStep(currentYear, forkName);
            }
            console.log("After simulation:", forkName, "Years with events:", JSON.stringify(eventsInYear));
        })
    };


    this.avg = function(scenario, aspect){



    };

    this.invAvg = function(scenario, aspect, probabilityField){



    };

    this.sum = function(scenario, aspect){
        var sum = 0;
        var s = series[scenario];
        s.foreach(function(i){
            sum+=i[aspect];
        })
        return sum;
    };

    this.getSeries = function(variableName){
        var ret = {};
        forks.forEach(function(forkName){
            ret[forkName] = series[forkName].map(function(item){
                return item[variableName];
            })
        });
        return ret;
    }
}


exports.run = function(sim){
    var s = new Simulation(sim);

    try{
        s.runAll()
    }catch(err){
        console.log("Failure in simulation", err.stack);
    }
    return s;
};

exports.print = function(result, varName){
    if(!varName){
        console.log(JSON.stringify(result));
        return;
    }
    console.log("Report for simulation:", varName);
    console.log(exports.csv(result, varName))
};

exports.csv = function(result, varName, separator){
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
        var res = lpad(line, 15) + ":";
        res += separator;
        s[line].forEach(function(o){
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

    var s = result.getSeries(varName);
    var res = genHeader(result.steps);

    for(var v in s){
        res += genLine(v);
    }
    return res;
};