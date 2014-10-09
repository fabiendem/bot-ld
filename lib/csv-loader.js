'use strict';

var Promise = require('promise');
var request = require('request');
var parse = require('csv-parse');
var utils = require('./utils.js');

// CSV is encoded in windows-1252, extend encoding for request.
var iconv = require('iconv-lite');
iconv.extendNodeEncodings();

var loadCSV = function(URLSourceCSV) {
    return new Promise(function (fulfill, reject){
        console.log('Loading the CSV...');
        request.get({
            url: URLSourceCSV,
            encoding: 'win1252'
        }, function (error, response, body) {
            if (!error &&
             response.statusCode === 200) {
                console.log('Got the CSV!');
                fulfill(body);
            }
            else {
                console.log('Error zhile getting the CSV!');
                reject();
            }
        });
    });
};

var stringToArray = function(stringInput, options)  {
    return new Promise(function (fulfill, reject){
        console.log('Parsing the CSV...');
        parse(stringInput, {
            delimiter: '|',
            quote: '',
            columns: options.firstLineIsColumnsTitle
        },  function(err, output) {
            if (err) {
                console.error('Error while parsing CSV: ', err);
                reject(err);
            }
            console.log('Got ' + output.length + ' lines');
            fulfill(output);
        });
    });
};

exports.getRandomItem = function (URLSourceCSV, options) {
    return new Promise(function (fulfill, reject) {
        loadCSV(URLSourceCSV)
        .then(function (csvString) {
            stringToArray(csvString, options)
            .then(function (items) {
                var item = utils.getRandomItem(items);
                fulfill(item);
            }, function(error) {
                reject(error);
            });
        });
    });
};

exports.getItems = function (URLSourceCSV, options) {
    return new Promise(function (fulfill, reject) {
        loadCSV(URLSourceCSV)
        .then(function (csvString) {
            stringToArray(csvString, options)
            .then(function (items) {
                fulfill(items);
            }, function(error) {
                reject(error);
            });
        });
    });
};