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

const successCode = ()=>({code:200})

const hasFoundData = (data)=>{
  if(!data){
    return false
  }

  //sent from rad-redis
  if(data.code === 404){
    return false
  }

}

/*API*/

class YOUTUBE_API extends RedisApi {
  constructor(options = {}, local = true) {
    super(options, local)
  }

  /*
  we remove the exisiting for updates
  */
  _deleteExisting(key) {
    return super.del(key)
  }

  getSidx(key) {
    let _key = this._prependProjectKey(key)
    console.log("Getting SIDX", _key);
    return super.hmget(_key)
    .then(data => {
      console.log("Got SIDX");
      if (hasFoundData(data)) {
        data.sidx = JSON.parse(data.sidx)
      }else{
        throw new Error(`No SIDX found for ${_key}`)
      }
      return data
    })
  }

  setSidx(key, manifestData) {
    let _d = prepareSidx(manifestData)
    let _key = this._prependProjectKey(key)
    return this._deleteExisting(_key).then(() => {
      super.hmset(_key, _d)
    }).then(() => {
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
    let _key = this._prependProjectKey(PLAYLISTS_KEY)
    return this._deleteExisting(_key).then(() => super.sadd(_key, playlistId))
      .then(() => {
        let { items } = playlistrawYoutubeData
        let _pitemKey = this._prependProjectKey(getPlaylistItemKey(playlistId))
        return Q.all(items.map(item => {
          return super.sadd(_pitemKey, JSON.stringify(item))
        }))
      })
  }

  getPlaylistItems(playlistId) {
    let _pitemKey = getPlaylistItemKey(playlistId)
    let _key = this._prependProjectKey(_pitemKey)
    return super.smembers(_key)
      .then(items => {
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
    let _key = this._prependProjectKey(UPLOADED_KEY)
    return this._deleteExisting(_key).then(() => super.sadd(UPLOADED_KEY, playlistId))
      .then(() => {
        //simple list of all the uploaded titles
        let _uploadTitlesKey = this._prependProjectKey(`${UPLOADED_TITLES_KEY}`)
        let _reportKey = this._prependProjectKey(`${UPLOADED_KEY}:${playlistId}:report`)
        let _playlistItemsKey = this._prependProjectKey(`${UPLOADED_KEY}:${playlistId}:items`)
          //the local files
        delete reportData.files
        return super.sadd(_uploadTitlesKey, JSON.stringify({
            title: reportData.title,
            playlistId: playlistId
          }))
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

  getUploadedVideoPlaylistItems(playlistId) {
    return super.smembers(this._prependProjectKey(`${UPLOADED_KEY}:${playlistId}:items`))
  }

  getUploadedVideoPlaylistReport(playlistId) {
    return super.smembers(this._prependProjectKey(`${UPLOADED_KEY}:${playlistId}:report`))
  }
}

module.exports = YOUTUBE_API
