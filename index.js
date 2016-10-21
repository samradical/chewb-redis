const redis = require('redis');
const _ = require('lodash');
const Q = require('bluebird');

let YoutubeApi = require('./youtube_api')

const REDIS = (() => {

    /*
    redis options
    */
  return new YoutubeApi(null)

})()

module.exports = REDIS