'use strict';

var request = require('request');
var parse = require('csv-parse');

// CSV is encoded in windows-1252, extend encoding for request.
var iconv = require('iconv-lite');
iconv.extendNodeEncodings();

var randomIndex = function (maxBound) {
    return Math.floor(Math.random() * maxBound);
};

var loadCSV = function(URLSourceCSV, callback) {
    console.log('Loading the CSV...');
    request.get({
        url: URLSourceCSV,
        encoding: 'win1252'
    }, function (error, response, body) {
        if (!error &&
         response.statusCode === 200) {
            console.log('Got the CSV!');
            callback(body);
        }
    });
};

var stringToArray = function(stringInput, options, callback)  {
    console.log('Parsing the CSV...');
    parse(stringInput, {
        delimiter: '|',
        quote: '',
        columns: options.firstLineIsColumnsTitle
    },  function(err, output) {
        if (err) {
            console.error(err);
            callback(err);
        }
        console.log('Got ' + output.length + ' lines');
        callback(null, output);
    });
};

var getRandomItem = function (items) {
    return items[randomIndex(items.length - 1)];
};

exports.getRandomItem = function (URLSourceCSV, options, callback) {
    loadCSV(URLSourceCSV, function(csvString) {
        stringToArray(csvString, options, function (error, items) {
            if (error) {
                return;
            }
            var item = getRandomItem(items);
            callback(item);
        });
    });
};

exports.getItems = function (URLSourceCSV, options, callback) {
    loadCSV(URLSourceCSV, function(csvString) {
        stringToArray(csvString, options, function (error, items) {
            if (error) {
                return;
            }
            callback(items);
        });
    });
};