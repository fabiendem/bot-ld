'use strict';

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


parser.getRandomItem(URL_SOURCE_CSV_ARTICLES, { firstLineIsColumnsTitle: true }, function (item) {
    console.log('Random article ' + item.pname);
    if(item.dispo === 'En stock') {
        // Grab an array of the article categories
        var articleCategoryIdsString = item.cat_ids;
        var articleCategoryIds = articleCategoryIdsString.split(',');

        parser.getItems(URL_SOURCE_CSV_CATEGORIES, { firstLineIsColumnsTitle: null }, function (categories) {
            //console.log(categories);
            var category;
            for (var i = 0; i < categories.length; i++) {
                category = categories[i];

                if(articleCategoryIds.indexOf(category[0]) > -1) {
                    console.log('Detailed category found: ' + category[1]);
                    if(acceptedCategories.indexOf(category[2]) > -1) {
                        console.log('General category ' + category[2] + ' accepted!');

                        var initialUrl = item.url;
                        var url = initialUrl.substring(0, initialUrl.length - '.htm'.length) + '~trkr~tt.htm';
                        var tweet = item.teaser + ' : ' + item.pname + ' ' + url + ' ' + item.price_eur + '€';
                        console.log('Tweeting: ' + tweet);
                        tt.tweet(tweet);
                    }
                    else {
                        console.log('General category ' + category[2] + ' refused!');
                    }
                }
            }
        });
    }
});
