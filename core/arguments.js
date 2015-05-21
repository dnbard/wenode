var _ = require('lodash'),
    config = require('../config');

exports.process = function(){
    var args = extractArguments(),
        city = null,
        temp = config.temperature,
        days = config.days,
        result;

//    _.each(args, function(arg){
//        if (arg === 'C' || arg === 'F'){
//            // temperature
//            temp = arg;
//        } else if {}
//    });

    return args;
}

function extractArguments(){
    return process.argv.map(function (val, index, array) {
        if (index < 2){ return null; }
        return val;
    }).reduce(function(prev, curr){
        var result;

        if (!Array.isArray(prev)){
            result = [];
        } else {
            result = prev;
        }

        if (curr){
            result.push(curr);
        }

        return result;
    });
}
