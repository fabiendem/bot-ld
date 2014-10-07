/*global describe,it*/
'use strict';
var assert = require('assert'),
  botLd = require('../lib/bot-ld.js');

describe('bot-ld node module.', function() {
  it('must be awesome', function() {
    assert( botLd.awesome(), 'awesome');
  });
});
