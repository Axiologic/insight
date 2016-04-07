var mean = 100;
var variance = 5;
var gaussian = require('gaussian');
var distribution = gaussian(mean, variance);
// Take a random sample using inverse transform sampling method.
for(var i =0 ;i <100; i++){
    var sample = distribution.ppf(Math.random());
    console.log(sample);
}
