const xhr = require('xhr-request')
const Q = require('bluebird')
const R = Q.promisify(xhr);

/*
Communicate with @samelie/rad-redis
*/

const RemoteApi = function(options) {

  const Request = (url, body) => {
    let isJson = (typeof body === 'object')
    console.log(`chewb-redis/remote_api`);
    console.log('\n');
    /*body.key = "sam"
    body.field = "text"
    body.value = "okay"*/

    console.log(JSON.stringify(body));

    console.log('\t', url);
    //console.log('\t', body);


    return R(url, {
      method: 'POST',
      json: true,
      body: body
    })
  }

  const _hgetAsync = (url, key, field) => {
    return Request(`${url}hget`, { key: key ,field:field})
  }

  const _hmgetAsync = (url, key,field) => {
    return Request(`${url}hmget`, { key: key ,field:field})
  }

  const _hgetallAsync = (url, key) => {
    return Request(`${url}hgetAll`, { key: key })
  }

  const _hmsetAsync = (url, key,field, value) => {
    return Request(`${url}hmset`, { key: key,field:field, value: value })
  }

  const _hsetAsync = (url, key, field, value) => {
    return Request(`${url}hset`, { key: key, field: field, value: value })
  }

  const _smembersAsync = (url, key) => {
    return Request(`${url}smembers`, { key: key })
  }

  const _saddAsync = (url, key, value) => {
    return Request(`${url}sadd`, { key: key, value: value })
  }

  let { host } = options

  if (!host) {
    throw new Error('Need remote host')
  }

  /*
    Match the redis_api in chewb-redis
    The remote api is implemented in rad-redis
    */

  //pair
  function del(key) {
    console.log("del()");
    return Request(`${host}del`, { key: key })
  }

  function delAsync(key) {
    console.log("delAsync()");
    return Request(`${host}del`, { key: key })
      .then(r => {
        console.log(r);
        return r
      })
  }

  //pair
  function hmget(key,field) {
    return _hmgetAsync(host, key,field)
  }

  function hmgetAsync(key,field) {
    return _hmgetAsync(host, key,field)
  }

  function hgetAsync(key, field) {
    return _hgetAsync(host, key, field)
  }


  function hgetallAsync(key) {
    return _hgetallAsync(host, key)
  }

  //pair
  function hset(key, field, val) {
    return _hsetAsync(host, key, field, val)
  }

  function hsetAsync(key, field, val) {
    return _hsetAsync(host, key, field, val)
  }
  //pair
  function hmset(key, field, val) {
    return _hmsetAsync(host, key, field, val)
  }

  function hmsetAsync(key, field, val) {
    return _hmsetAsync(host, key, field, val)
  }

  //pair
  function smembers(key) {
    return _smembersAsync(host, key)
  }

  function smembersAsync(key) {
    return _smembersAsync(host, key)
  }

  function sadd(key, val) {
    return _saddAsync(host, key, val)
  }

  function saddAsync(key, val) {
    return _saddAsync(host, key, val)
  }

  //pair
  function hremove(key, field) {}

  function hdel(key, field) {}

  function rpushAsync(key, val) {}

  function getSidx(key) {
    return Request(`${host}youtube/get-sidx`, { key: key })
  }

  function setSidx(key, val) {
    return Request(`${host}youtube/set-sidx`, { key: key, value: value })
  }

  function setYoutubePlaylistItems(key, val) {
    return Request(`${host}youtube/set-youtube-playlist-items`, { key: key, value: value })
  }

  function getPlaylistItems(key) {
    return Request(`${host}youtube/get-youtube-playlist-items`, { key: key })
  }

  function setUploadedVideoPlaylist(key, val) {
    return Request(`${host}youtube/set-uploaded-video-playlist`, { key: key, value: value })
  }

  function getUploadedVideoPlaylistItems(key) {
    return Request(`${host}youtube/get-uploaded-playlist-items`, { key: key })
  }

  function getUploadedVideoPlaylistReport(key) {
    return Request(`${host}youtube/get-uploaded-playlist-report`, { key: key })
  }


  return {
    del: del,
    delAsync: delAsync,
    hmget: hmget,
    hmgetAsync: hmgetAsync,
    hgetallAsync: hgetallAsync,
    hset: hset,
    hsetAsync: hsetAsync,
    hmset: hmset,
    hmsetAsync: hmsetAsync,
    smembers: smembers,
    smembersAsync: smembersAsync,
    sadd: sadd,
    saddAsync: saddAsync,
    hremove: hremove,
    hdel: hdel,
    rpushAsync: rpushAsync,
    getSidx: getSidx,
    setSidx: setSidx,
    setYoutubePlaylistItems: setYoutubePlaylistItems,
    getPlaylistItems: getPlaylistItems,
    setUploadedVideoPlaylist: setUploadedVideoPlaylist,
    getUploadedVideoPlaylistItems: getUploadedVideoPlaylistItems,
    getUploadedVideoPlaylistReport: getUploadedVideoPlaylistReport,
  }



}

module.exports = RemoteApi
