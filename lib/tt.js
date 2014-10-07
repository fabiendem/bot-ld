'use strict';

var Twit = require('twit');
var twitter_credentials = require('../.twitter_credentials.js');

var T = new Twit(twitter_credentials);

exports.tweet = function(text) {
    T.post('statuses/update', { status: text }, function(err, data, response) {
        if (err) {
            console.error(':( Something went wrong while tweeting', err);
            return;
        }
        console.log('Tweeted !');
    });
};
