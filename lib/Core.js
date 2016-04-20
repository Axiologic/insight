
var gaussian = require('gaussian');

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
    var currentYear     = 0;

    var yearsState      = [];
    var steps           = sim.steps;
    var self            = this;


    this.stepAction = sim.eachYear;
    var eventsInYear = {};
    var eventsBelief = {};
    
    if(!this.stepAction){
        this.stepAction = function(){
            console.log("Dummy action...");
            //nothing by default
        }
    }

    this.preStepAction = sim.beforeEachYear;
    if(!this.preStepAction){
        this.preStepAction = function(){
            //nothing by default
        }
    }
    ////////// END INITIALISATION


    function decideYearForBelief(belief, eventName){
        if(belief == 0){
            return -1;
        }
        var mean = (steps - currentYear)/2;
        var variance = mean;
        var distribution = gaussian(mean, variance);
        var sample = Math.floor(distribution.ppf(Math.random()));
        var chance = Math.random();
        if(belief < chance){
           // console.log("Event", eventName, "canceled by belief", belief, "in year", sample);
            sample = -1;  // will not happen
        } else {
            //console.log("Event", eventName, "in year", sample);
        }
        return sample;
    }


    function setInitialValues(){
        sim.Variables.forEach(function(value, item){
            self[item] = value;
        })

        self.___currentAction = sim.Scenarios[scenarioName];
        self.___currentAction();
        self.___currentAction= null;

        yearsState      = [];
        for(var v in sim.Events){
            var e = sim.Events[v];
            eventsInYear[v] = decideYearForBelief(e.Belief, v);
            eventsBelief[v] = e.Belief;
        }

    }

    this.runEvents = function(year){
        eventsInYear.forEach(function(value, eventName){
          if(value == year){
              var ev = sim.Events[eventName];
              self.___currentAction = ev.Effect;
              self.___currentAction();
              self.___currentAction = null;
              if(undefined != ev.Recurrent){
                  self.setBelief(eventName, 0);
              }
          }
        })
    }
    
    //////////////// END STOCHASTIC SIMULATION METHODS

    this.setBelief = function(eventName, value){
        eventsBelief[eventName] = value;
        eventsInYear[eventName] = decideYearForBelief(value, eventName);
    };

    this.currentScenario = function(){
        return scenarioName;
    };

    this.history = function(){
        return yearsState;
    };

    this.currentYear = function(){
        return currentYear;
    };



    ///////////////// END OOP SURROGATE 
    
    this.simulate = function(){

    setInitialValues();

    for(var y = 0; y < sim.steps; y++ ){
        currentYear = y;
        this.preStepAction(yearsState, y);
        this.runEvents(y);
        this.stepAction(yearsState, y);
        yearsState.push(clone(this));
    }
    return yearsState;
    }
}

function simulateScenario(sim, scenarioName, result){
    var simulationCount = 0;
    var currentAverage = [];
    var lastAverage    = null;
    var vars = sim.Variables;
    var threshold = sim.threshold;
    var maxSimulations = sim.maxSimulations
    var minSimulations = sim.minSimulations;
    if(!minSimulations){
        minSimulations = 10;
    }

    if(!threshold){
        threshold = 1/maxSimulations;
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
        if(simulationCount < minSimulations) {
            return false;
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
        var step = 0;
        return currentAverage.map(function(currentVars){
            var newVarsForCurrentYear = newValues[step];
            if(!newVarsForCurrentYear){
                console.log("Wrong....", step, newVarsForCurrentYear, currentValue);
            }
            var res = clone(currentVars);
            for(var v in vars){
                res[v] = Math.round((res[v] *  simulationCount + newVarsForCurrentYear[v])/(simulationCount+1) *100)/100;
            }
            step++;
            return res;
        })
    }

    do{
        lastAverage = currentAverage;
        var fork = new ForkOfTheUniverse(sim, scenarioName);
        currentAverage = computeAverage(lastAverage, fork.simulate());
        simulationCount++;
        //console.log("   >>>> Doing simulation ", simulationCount, " Scenario:",scenarioName);
    } while((!converged(currentAverage, lastAverage)))

    result.Average       = currentAverage;
    result.simulations   = simulationCount;
    return result;
}

function Simulation(sim){
    var finalResult = {};
    this.runAll = function(){
        for(var scenarioName in sim.Scenarios){
            finalResult[scenarioName] = {};
            simulateScenario(sim, scenarioName, finalResult[scenarioName])
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
    console.log("Scenario ", scenario , "on dimension", varName, " Obtained in", result[scenario].simulations , "simulations");
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