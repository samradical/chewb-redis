let RedisApi = require('./redis_api')
const Q = require('bluebird');
const _ = require('lodash');
const colors = require('colors');
const check = require('check-types');

const successCode = () => ({ code: 200 })

const hasFoundData = (data) => {
  if (!data) {
    return false
  }

  //sent from rad-redis
  if (data.code === 404) {
    return false
  }
}

/*API*/

class USER_API {

  constructor(redisClient) {
    this.redisClient = redisClient
  }

  login(username) {
    let _key = this.redisClient._prependProjectKey(`users:${username}`)
      //field username
    let _field = 'username'
    console.log(colors.yellow(`@chewb-redis user-api login() ${_key} ${_field}`));
    return this.redisClient.hgetAll(_key)
      .then(data => {
        if (!check.object(data)) {
          data = JSON.parse(data)
        }
        if (hasFoundData(data)) {
          console.log(colors.green(`\t @chewb-redis user-api login() ${_key}`));
        } else {
          return this.redisClient.hset(_key, _field, username)
            //throw new Error(`No User found found for ${_key}`)
        }
        return data
      })
  }

  _storeVideoInTotal(field, data){
    const _key = this.redisClient._prependProjectKey(`videos`)
    console.log(colors.yellow(`@chewb-redis user-api _storeVideoInTotal() ${_key} ${field} ${data}`));
    return this.redisClient.hmset(_key, field, data)
  }

  storeVideo(username, field, value) {
    let _key = this.redisClient._prependProjectKey(`users:${username}:videos`)
    this._storeVideoInTotal(field, _key).finally()
      //field username
    let _field = field
    console.log(colors.yellow(`@chewb-redis user-api storeVideo() ${_key} ${_field}`));
    return this.redisClient.hmget(_key, _field)
      .then(data => {
        data = data || {}
        if (!check.object(data)) {
          data = JSON.parse(data)
        }

        data = Object.assign({}, data, value)

        return this.redisClient.hmset(_key, _field, data)
      })
  }

}

module.exports = USER_API
