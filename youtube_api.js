let RedisApi = require('./redis_api')
const Q = require('bluebird');
const _ = require('lodash');
let SIDX_VO = {
  itag: null,
  videoId: null,
  codecs: null,
  resolution: null,
  indexRange: null,
  container: 'mp4',
}

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

/*API*/

class YOUTUBE_API extends RedisApi {
  getSidx(key) {
    return super.hmget(key).then(data => {
      if (data) {
        data.sidx = JSON.parse(data.sidx)
      }
      return data
    })
  }
  setSidx(key, manifestData) {
    let _d = prepareSidx(manifestData)
    return super.hmset(key, _d)
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
    return super.sadd(PLAYLISTS_KEY, playlistId)
      .then(() => {
        let { items } = playlistrawYoutubeData
        let _pitemKey = getPlaylistItemKey(playlistId)
        return Q.all(items.map(item => {
          return super.sadd(_pitemKey, JSON.stringify(item))
        }))
      })
  }
  getPlaylistItems(playlistId) {
    let _pitemKey = getPlaylistItemKey(playlistId)
    return super.smembers(_pitemKey).then(items => {
      if (!items.length) {
        throw new Error(`No items for ${playlistId}`)
      } else {
        return items.map(string => JSON.parse(string))
      }
    })
  }

  
  /*
  Must be within a playlist,

  report data is the durations from movie-splitter

  */

  setUploadedVideoPlaylist(playlistId, reportData, playlistData = []) {
    return super.sadd(UPLOADED_KEY, playlistId)
      .then(() => {
        //simple list of all the uploaded titles
        let _uploadTitlesKey = `${UPLOADED_TITLES_KEY}`
        let _reportKey = `${UPLOADED_KEY}:${playlistId}:report`
        let _playlistItemsKey = `${UPLOADED_KEY}:${playlistId}:items`
          //the local files
        delete reportData.files
        return super.sadd(_uploadTitlesKey, JSON.stringify({ title: reportData.title, playlistId: playlistId }))
          .then(() => {
            return super.sadd(_reportKey, JSON.stringify(reportData))
              .then(() => {
                return super.sadd(_playlistItemsKey, JSON.stringify(playlistData))
              })
          })
      })
  }

  /*
  get the youtube items from an uploaded playlist
  */

  getUploadedVideoPlaylistItems(playlistId){
    return super.smembers(`${UPLOADED_KEY}:${playlistId}:items`)
  }

  getUploadedVideoPlaylistReport(playlistId){
    return super.smembers(`${UPLOADED_KEY}:${playlistId}:report`)
  }
}

module.exports = YOUTUBE_API