const xhr = require('xhr-request')
const Q = require('bluebird')
const R = Q.promisify(xhr);


const Request = (url, body) => {
  let isJson = (typeof body === 'object')

  console.log('\t',url);

  return R(url, {
    method: 'POST',
    json:true,
    body: body
  })
}

const hgetallAsync = (url, key) => {
  return Request(`${url}hmget`, { key: key })
}

const hmsetAsync = (url, key, value) => {
  return Request(`${url}hmset`, { key: key, value: value })
}

const hsetAsync = (url, field, key, value) => {
  return Request(`${url}hset`, { key: key, field:field, value: value })
}

const smembersAsync = (url, key) => {
  return Request(`${url}smembers`, { key: key })
}

const saddAsync = (url, key, value) => {
  return Request(`${url}sadd`, { key: key, value: value })
}

const RemoteApi = function(options) {

  let {host} = options

  if (!host) {
    throw new Error('Need remote host')
  }

  return {

    /*
    Match the redis_api in chewb-redis
    The remote api is implemented in rad-redis
    */

    //pair
    del: (key) => {
      return Request(`${host}del`, { key: key })
    },
    delAsync: (key) => {
      return Request(`${host}del`, { key: key })
    },

    //pair
    hmget: (key) => {
      return hgetallAsync(host, key)
    },
    hgetallAsync: (key) => {
      return hgetallAsync(host, key)
    },

    //pair
    hset: (key,field, val) => {
      return hmsetAsync(host, key, field, val)
    },
    hsetAsync:(key, field, val)=>{
      return hmsetAsync(host, key,field, val)
    },
    //pair
    hmset: (key, val) => {
      return hmsetAsync(host, key, val)
    },
    hmsetAsync: (key, val) => {
      return hmsetAsync(host, key, val)
    },

    //pair
    smembers: (key) => {
      return hmsetAsync(host, key)
    },
    smembersAsync: (key) => {
      return hmsetAsync(host, key)
    },

    sadd:(key, val)=>{
      return saddAsync(host, key, val)
    },
    saddAsync: (key, val) => {
      return saddAsync(host, key, val)
    },

    //pair
    hremove(key, field) {},
    hdel(key, field) {},
    rpushAsync: (key, val) => {},

    getSidx: (key) => {
      return Request(`${host}youtube/get-sidx`, { key: key })
    },
    setSidx: (key, val) => {
      return Request(`${host}youtube/set-sidx`, { key: key, value: value })
    },
    setYoutubePlaylistItems: (key, val) => {
      return Request(`${host}youtube/set-youtube-playlist-items`, { key: key, value: value })
    },
    getPlaylistItems: (key) => {
      return Request(`${host}youtube/get-youtube-playlist-items`, { key: key })
    },
    setUploadedVideoPlaylist: (key, val) => {
      return Request(`${host}youtube/set-uploaded-video-playlist`, { key: key, value: value })
    },
    getUploadedVideoPlaylistItems: (key) => {
      return Request(`${host}youtube/get-uploaded-playlist-items`, { key: key })
    },
    getUploadedVideoPlaylistReport: (key) => {
      return Request(`${host}youtube/get-uploaded-playlist-report`, { key: key })
    },
  }

}

module.exports = RemoteApi