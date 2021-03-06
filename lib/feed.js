var Promise = require('promise');
var FeedParser = require('feedparser');
var request = require('request');

exports.getNews = function (keyword, providers) {

    var urlRssFeed = 'http://fr.news.search.yahoo.com/rss?p=' + keyword + '&c=&eo=UTF-8&sort=time';
    if (providers && providers.length > 0) {
        urlRssFeed += '&provider=';
        for (var i = 0; i < providers.length; i++) {
            urlRssFeed += providers[i];
            if(i < providers.length - 1) {
                urlRssFeed += ',';
            }
        }
    }

    console.log('Getting news from: ' + urlRssFeed);

    return new Promise(function (fulfill, reject) {
        var req = request(urlRssFeed);
        var feedparser = new FeedParser();

        req.on('response', function (res) {
            var stream = this;
            if (res.statusCode != 200) {
                return this.emit('error', new Error('Bad status code'));
            }
            stream.pipe(feedparser);
        })
        .on('error', function (error) {
            // handle any request errors
            console.error('Error while getting the RSS feed', error);
            reject();
        });

        var items = [];
        feedparser.on('readable', function() {
            // One new item to read
            var stream = this;
            var meta = this.meta;
            var item;
            // Consume the stream
            while (item = stream.read()) {
                //console.log(item.pubDate + ' : ' + item.title + ' -> \n' + item.link + '\n');
                items.push(item);
            }
        })
        .on('error', function(error) {
            console.error('Error while parsing the RSS feed', error);
            reject();
        })
        .on('end', function () {
            console.log('Got ' + items.length + ' news');
            fulfill(items);
        });
    });
};
