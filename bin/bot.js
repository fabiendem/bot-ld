'use strict';

var Promise = require('promise');
var csvLoader = require('../lib/csv-loader.js');
var tt = require('../lib/tt.js');
var feed = require('../lib/feed.js');
var utils = require('../lib/utils.js');

var SourceCsv = require('../.source_csv.js');
var keyword = require('../.feed_keyword.js');

var acceptedCategories = [
 '1',
 '11',
 '111',
 '12',
 '121',
 '131',
 '14',
 '141',
 '142',
 '2',
 '21',
 '211',
 '22',
 '221',
 '23',
 '231',
 '24',
 '241',
 '3',
 '31',
 '311',
 '32',
 '321',
 '33',
 '331',
 '34',
 '341']; 

var URL_SOURCE_CSV_ARTICLES = SourceCsv.items;
var URL_SOURCE_CSV_CATEGORIES = SourceCsv.categories;

var loadItemsAndCategories = function () {
    return new Promise.all([
        csvLoader.getItems(URL_SOURCE_CSV_ARTICLES, { firstLineIsColumnsTitle: true }),
        csvLoader.getItems(URL_SOURCE_CSV_CATEGORIES, { firstLineIsColumnsTitle: null })
    ]);
};

var buildTrackedURL = function (initialUrl) {
    return initialUrl.substring(0, initialUrl.length - '.htm'.length) + '~trkr~tt.htm';
};

var buildTweet = function (article, url) {
    return article.teaser + ' : ' + article.pname + ' ' + url + ' ' + article.price_eur + '€';
};

var tweetArticle = function (article) {
    console.log('Tweet article ' + article.pname);
    // Build up the url
    var url = buildTrackedURL(article.url);

    // Build up the tweet
    var tweet = buildTweet(article, url);
    
    // Tweet !
    console.log('Tweeting: ' + tweet);
    tt.tweet(tweet);
};

var isAcceptedCategory = function (acceptedCategories, categoryId) {
    return acceptedCategories.indexOf(categoryId) > -1;
};

var isArticleAvailable = function (article) {
    return article.dispo === 'En stock';
};

var findAcceptableArticle = function (articles, catalogCategories) {
    console.log('Finding acceptable article...');
    var article = utils.getRandomItem(articles);
    var articleFound = false;

    while (! articleFound) {
        console.log('Try article...');
        if(isArticleAvailable(article)) {
            console.log('Article available');

            // Grab an array of the article categories
            var articleCategoryIdsString = article.cat_ids;
            var articleCategoryIds = articleCategoryIdsString.split(',');
            var catalogCategory;

            // Go through the categories of the catalog
            for (var i = 0; i < catalogCategories.length; i++) {
                // Break second loop if article has been found
                if (articleFound) {
                    break;
                }

                catalogCategory = catalogCategories[i];

                // Find corresponding category
                if(articleCategoryIds.indexOf(catalogCategory[0]) > -1) {
                    console.log('Detailed category found: ' + catalogCategory[1]);
                    if(isAcceptedCategory(acceptedCategories, catalogCategory[2])) {
                        console.log('General category ' + catalogCategory[2] + ' accepted!');
                        articleFound = true;
                    }
                    else {
                        console.log('General category ' + catalogCategory[2] + ' refused!');
                        article = utils.getRandomItem(articles);
                    }
                }
                else {
                    article = utils.getRandomItem(articles);
                }
            }
        }
        else {
            console.log('Getting another article...');
            article = utils.getRandomItem(articles);
        }
    }
    console.log('Found article');
    return article;
};

var tweetRandomArticle = function () {
    console.log('Tweeting a random article...');
    loadItemsAndCategories().then(function (results) {
        console.log('Loaded both CSV');
        // Split results from both promises
        var articles = results[0];
        var catalogCategories = results[1];

        var article = findAcceptableArticle(articles, catalogCategories);
        tweetArticle(article);
    },
    function(error) {
        console.error('Failed to load one of the array', error);
    });
};

var tweetNews = function (keyword, acceptedNewsWebsites, newsPublished) {
    feed.getNews(keyword, acceptedNewsWebsites)
    .then(function(news) {
        console.log('Yeah, got the news');
        if(news.length > 0) {
            var indexNewsItem = 0;
            var newsItem = news[indexNewsItem];
            while(newsPublished.indexOf(newsItem.title) > -1) {
                indexNewsItem++;
                if(indexNewsItem >= news.length) {
                    console.log('No more news to publish for now :(');
                    return;
                }
                newsItem = news[indexNewsItem];
            }
            console.log('News item: ' + newsItem.title);
            var hashtag = keyword;
            var tweet = newsItem.title + ' #' + 'dentelle' + ' ' + newsItem.link;
            console.log('Tweeting: ' + tweet);
            newsPublished.push(newsItem.title);
            tt.tweet(tweet);
        }
        else {
            console.log('No news to publish for now :(');
        }
    }, function (error) {
        console.error('Error while grabbing the news feed', error);
    });
};

var idNewsYahoo = 6478847;
var idNewsPurePeople = 3373637;
var acceptedNewsWebsites = [idNewsYahoo,idNewsPurePeople];
var newsPublished = [];

var randomTweet = function() {
    // Get a random number between 0 and 100 inclusive
    var randomNumber = utils.getRandomIndex(101);

    if(randomNumber >= 70) {
        console.log('Destiny says tweet an article');
        // Tweet article
        tweetRandomArticle();
    }
    else {
        console.log('Destiny says tweet a news');
        tweetNews(keyword, acceptedNewsWebsites, newsPublished);
    }
};

var intervalMinutes = 30;
var intervalMs = intervalMinutes * 60 * 1000;
console.log('Starting bot at ' + utils.getFormattedDate());
randomTweet();
setInterval(function() {
    console.log('Periodic random tweet at ' + utils.getFormattedDate());
    randomTweet();
    console.log('Next tweet in ' + intervalMinutes + ' minutes');
}, intervalMs);
