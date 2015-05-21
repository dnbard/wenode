#! /usr/bin/env node

var _ = require('lodash'),
    arguments = require('./core/arguments'),
    config = require('./config'),
    request = require('request'),
    args = arguments.process(),
    colors = require('colors'),
    codes = require('./codes');

var city = args[0];

request({
    uri: 'https://api.worldweatheronline.com/free/v2/weather.ashx',
    qs: {
        key: config.apiKey,
        format: config.format,
        q: city,
        num_of_days: args[1] || '5'
    }
}, function (error, response, body) {
    body = JSON.parse(body);

    var weather = body.data.weather,
        graphData = _.chain(weather).map(function (weatherInfo) {
            var date = weatherInfo.date,
                result = weatherInfo.hourly.map(function (hourInfo) {
                    return {
                        date: date,
                        tempC: hourInfo.tempC,
                        timestamp: date + ' ' + hourInfo.time,
                        weatherCode: hourInfo.weatherCode,
                        time: hourInfo.time,
                        wind: hourInfo.windspeedKmph
                    };
                });

            return result;
        }).union().flatten().value();

    console.log(city.toUpperCase().green + ':');

    var daysTemp = _.chain(graphData).groupBy('date').map(function(gd){
        return {
            date: gd[0].date,
            max: _.max(gd, 'tempC').tempC,
            min: _.min(gd, 'tempC').tempC,
            weather: _.chain(gd).map(function(d){
                return codes[d.weatherCode]
            }).unique().value(),
            morning: _.find(gd, function(d){
                var time = parseInt(d.time);
                return time > 600 && time < 1000;
            }),
            noon: _.find(gd, function(d){
                var time = parseInt(d.time);
                return time > 1000 && time < 1400;
            }),
            evening: _.find(gd, function(d){
                var time = parseInt(d.time);
                return time > 1600 && time < 2000;
            }),
            night: _.find(gd, function(d){
                var time = parseInt(d.time);
                return time > 0 && time < 300;
            })
        }
    }).value();

    _.each(daysTemp, function(d){
        console.log('%s %s-%s°C', d.date, d.morning.tempC, d.max);
        console.log(' · %s %s : %s°C %sKmph',
                    'Morning'.bold, codes[d.morning.weatherCode], d.morning.tempC.bold, d.morning.wind);
        console.log(' · %s %s : %s°C %sKmph',
                    'Noon'.bold ,codes[d.noon.weatherCode], d.noon.tempC.bold, d.noon.wind);
        console.log(' · %s %s : %s°C %sKmph',
                    'Evening'.bold, codes[d.evening.weatherCode], d.evening.tempC.bold, d.evening.wind);
        console.log(' · %s %s : %s°C %sKmph',
                    'Night'.bold ,codes[d.night.weatherCode], d.night.tempC.bold, d.night.wind);
    });
});
