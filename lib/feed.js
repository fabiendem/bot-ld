var FeedParser = require('feedparser');
var request = require('request');

var req = request('http://fr.news.search.yahoo.com/rss?p=lingerie&c=&eo=UTF-8&sort=time');
var feedparser = new FeedParser();

req.on('error', function (error) {
    // handle any request errors
    console.log('Error while getting the RSS feed', error);
});

req.on('response', function (res) {
    var stream = this;

    if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

    stream.pipe(feedparser);
});


feedparser.on('error', function(error) {
    // always handle errors
});

feedparser.on('readable', function() {
    // This is where the action is!
    var stream = this;
    var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
    var item;

    while (item = stream.read()) {
        console.log(item.pubDate + ' : ' + item.title + ' -> \n' + item.link + '\n');
    }
});
