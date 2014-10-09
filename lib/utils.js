'use strict';

exports.randomIndex = function (maxBound) {
    return Math.floor(Math.random() * maxBound);
};

exports.getRandomItem = function (items) {
    return items[this.randomIndex(items.length - 1)];
};