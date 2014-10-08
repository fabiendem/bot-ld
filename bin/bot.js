'use strict';

var Promise = require('promise');
var parser = require('../lib/parser.js');
var tt = require('../lib/tt.js');

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

var sourceCsv = require('../.source_csv.js');
var URL_SOURCE_CSV_ARTICLES = sourceCsv.items;
var URL_SOURCE_CSV_CATEGORIES = sourceCsv.categories;

var loadData = function () {
    return new Promise.all([
        parser.getRandomItem(URL_SOURCE_CSV_ARTICLES, { firstLineIsColumnsTitle: true }),
        parser.getItems(URL_SOURCE_CSV_CATEGORIES, { firstLineIsColumnsTitle: null })
    ]);
};

var buildTrackedURL = function (initialUrl) {
    return initialUrl.substring(0, initialUrl.length - '.htm'.length) + '~trkr~tt.htm';
};

var buildTweet = function (article, url) {
    return article.teaser + ' : ' + article.pname + ' ' + url + ' ' + article.price_eur + '€';
};

var isAcceptedCategory = function (acceptedCategories, categoryId) {
    return acceptedCategories.indexOf(categoryId) > -1;
};

var isArticleAvailable = function (article) {
    return article.dispo === 'En stock';
};

loadData().then(function(results) {
    console.log('Loaded both CSV');
    
    var article = results[0];
    var catalogCategories = results[1];

    console.log('Random article ' + article.pname);

    if(isArticleAvailable(article)) {
        // Grab an array of the article categories
        var articleCategoryIdsString = article.cat_ids;
        var articleCategoryIds = articleCategoryIdsString.split(',');

        var catalogCategory;
        var tweeted = false;

        // Go through the categories of the catalog
        for (var i = 0; i < catalogCategories.length; i++) {
            
            if(tweeted) {
                return;
            }

            catalogCategory = catalogCategories[i];

            // Find corresponding category
            if(articleCategoryIds.indexOf(catalogCategory[0]) > -1) {
                console.log('Detailed category found: ' + catalogCategory[1]);
                if(isAcceptedCategory(acceptedCategories, catalogCategory[2])) {

                    console.log('General category ' + catalogCategory[2] + ' accepted!');

                    // Build up the url
                    var url = buildTrackedURL(article.url);

                    // Build up the tweet
                    var tweet = buildTweet(article, url);
                    
                    // Tweet !
                    console.log('Tweeting: ' + tweet);
                    tt.tweet(tweet);
                    tweeted = true;
                }
                else {
                    console.log('General category ' + catalogCategory[2] + ' refused!');
                }
            }
        }
    }
}, function(error) {
    console.error('Failed to load one of the array', error);
});