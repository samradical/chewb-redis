let RedisApi = require('./redis_api')
const Q = require('bluebird');
const _ = require('lodash');
const colors = require('colors');
const check = require('check-types');

let SIDX_VO = {
  itags: null,
  videoId: null,
  codecs: null,
  resolution: null,
  indexRange: null,
  container: 'mp4',
}

const SIDX_KEY = 'sidx'
const PLAYLISTS_KEY = 'playlists'
const PLAYLIST_KEY = 'playlist'
const UPLOADED_KEY = 'uploaded'
const UPLOADED_TITLES_KEY = 'uploaded:titles'

/*HERLPERS*/


const prepareSidx = (manifestData) => {
  let _vo = Object.assign({}, SIDX_VO)
  let _info = manifestData.info
  _.forIn(_vo, (val, key) => {
    if (_info[key]) {
      _vo[key] = _info[key]
    }
  })
  _vo.sidx = JSON.stringify(manifestData.sidx)
  return _vo
}

const getPlaylistItemKey = (playlistId) => {
  return `${PLAYLIST_KEY}:${playlistId}:items`
}

const successCode = () => ({ code: 200 })

const hasFoundData = (data) => {
  if (!data) {
    return false
  }

  //sent from rad-redis
  if (data.code === 404) {
    return false
  }

  return true;
}

/*API*/

class YOUTUBE_API {

  constructor(redisClient) {
    this.redisClient = redisClient
  }

  /*
  we remove the exisiting for updates
  */
  _deleteExisting(key) {
    return this.redisClient.del(key)
  }

  getSidx(field) {
    let _key = this.redisClient._prependProjectKey('sidx')
    let _field = field
    console.log(colors.yellow(`@chewb-redis youtubeA-api getSidx() ${_key} ${_field}`));
    return this.redisClient.hget(_key, _field)
      .then(data => {
        if (!check.object(data)) {
          data = JSON.parse(data)
        }
        if (hasFoundData(data)) {
          console.log(colors.green(`\t @chewb-redis youtubeA-api getSidx() ${_key}`));
        } else {
          throw new Error(`No SIDX found for ${_key}`)
        }
        return data
      })
  }

  setSidx(field, manifestData) {
    console.log(manifestData);
    let _d = prepareSidx(manifestData)
    let _key = this.redisClient._prependProjectKey('sidx')
    let _field = field
    console.log(colors.yellow(`@chewb-redis youtubeA-api setSidx() ${_key} ${_field}`));
    if (check.object(_d)) {
      _d = JSON.stringify(_d)
    }
    return this.redisClient.hmset(_key, _field, _d)
      .then(() => {
        console.log(colors.green(`\t @chewb-redis youtubeA-api setSidx() ${_key}`));
        return successCode()
      })
  }

  setIndexRange(key, range) {
      //return set(key, ['indexBuffer', range.toString()])
    }
    /*
    {
      items:[]
    }
    */
  setYoutubePlaylistItems(playlistId, playlistrawYoutubeData) {
    let _key = this.redisClient._prependProjectKey(PLAYLISTS_KEY)
      //delete?
      //return this._deleteExisting(_key)
    console.log(colors.yellow(`@chewb-redis youtubeA-api setYoutubePlaylistItems() ${_key}`));
    return this.redisClient.sadd(_key, playlistId)
      .then(() => {
        let { items } = playlistrawYoutubeData || {items:[]}
        let _pitemKey = this.redisClient._prependProjectKey(getPlaylistItemKey(playlistId))
        return Q.all(items.map(item => {
          console.log(colors.green(`\t @chewb-redis youtubeA-api setYoutubePlaylistItems() ${_key}`));
          return this.redisClient.sadd(_pitemKey, JSON.stringify(item))
        }))
      })
  }

  getPlaylistItems(playlistId) {
    let _pitemKey = getPlaylistItemKey(playlistId)
    let _key = this.redisClient._prependProjectKey(_pitemKey)
    console.log(colors.yellow(`@chewb-redis youtubeA-api getPlaylistItems() ${_key}`));
    return this.redisClient.smembers(_key)
      .then(items => {
        if (!check.object(items)) {
          items = JSON.parse(items)
        }
        if (!items.length) {
          throw new Error(`No items for ${playlistId}`)
        } else {
          console.log(colors.green(`\t @chewb-redis youtubeA-api getPlaylistItems() ${_key}`));
          return items.map(string => JSON.parse(string))
        }
      })
  }


  /*
  Must be within a playlist,

  report data is the durations from movie-splitter

  */

  setUploadedVideoPlaylist(playlistId, reportData, playlistData = []) {
    let _key = this.redisClient._prependProjectKey(UPLOADED_KEY)
      //return this._deleteExisting(_key)
    return this.redisClient.sadd(UPLOADED_KEY, playlistId)
      .then(() => {
        //simple list of all the uploaded titles
        let _uploadTitlesKey = this.redisClient._prependProjectKey(`${UPLOADED_TITLES_KEY}`)
        let _reportKey = this.redisClient._prependProjectKey(`${UPLOADED_KEY}:${playlistId}:report`)
        let _playlistItemsKey = this.redisClient._prependProjectKey(`${UPLOADED_KEY}:${playlistId}:items`)
          //the local files
        delete reportData.files
        return this.redisClient.sadd(_uploadTitlesKey, JSON.stringify({
            title: reportData.title,
            playlistId: playlistId
          }))
          .then(() => {
            return this.redisClient.sadd(_reportKey, JSON.stringify(reportData))
              .then(() => {
                return this.redisClient.sadd(_playlistItemsKey, JSON.stringify(playlistData))
              })
          })
      })
  }

  /*
  get the youtube items from an uploaded playlist
  */

  getUploadedVideoPlaylistItems(playlistId) {
    return this.redisClient.smembers(this.redisClient._prependProjectKey(`${UPLOADED_KEY}:${playlistId}:items`))
  }

  getUploadedVideoPlaylistReport(playlistId) {
    return this.redisClient.smembers(this.redisClient._prependProjectKey(`${UPLOADED_KEY}:${playlistId}:report`))
  }
}

module.exports = YOUTUBE_API
