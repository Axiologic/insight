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

function Simulation(sim){
    var vars = {};
    var currentYear = 0;
    var currentSimulationName = "";
    
    var defaultVars = clone(sim.Start);
    var series = {};
    var steps = sim.steps;
    var self = this;
    this.steps = sim.steps;

    var stepActions = sim.stepActions;
    if(!stepActions){
        stepActions = function(history, currentYear){
            //nothing by default
        }
    }

    function transformProbabilityInYears(probability, years){
        var result = Math.round(years - (probability * years));
        //do something else here with the result !?
        return result;
    }

    var eventsInYear = {};
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

    this.increaseProbability = function(eventName, value, years){
        eventsInYear[eventName] += transformProbabilityInYears(value , years);
    };

    this.decreaseProbability = function(eventName, value, years){
        eventsInYear[eventName] -= transformProbabilityInYears(value , years);
    };

    this.setProbability = function(eventName, value, years){
        eventsInYear[eventName] = currentYear + transformProbabilityInYears(value , years);
    };

    this.currentScenario = function(){


    };

    

    this.setVar = function(name, value){
        vars[name] = value;
    };

    this.getVar = function(name){
        return vars[name];
    };


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
            vars = clone(defaultVars);
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