let YoutubeApi = require('./youtube_api')
let UserApi = require('./user_api')

const client = require('./client');
const redis = require('redis');
const _ = require('lodash');
const Q = require('bluebird');
const colors = require('colors');
const check = require('check-types');

Q.promisifyAll(redis.RedisClient.prototype);
Q.promisifyAll(redis.Multi.prototype);

class REDIS_API {

  constructor(options = {}, local = true) {
    console.log(colors.green(`REDIS_API local: ${local}`));
    this.client = client(options, local)
    this.projectKey = options.project ? `${options.project}:` : ""

    this.youtube = new YoutubeApi(this)
    this.user = new UserApi(this)

  }

  _prependProjectKey(str) {

    return `${this.projectKey}${str}`
  }

  hset(key, field, value) {
    if (check.object(value)) {
      value = JSON.stringify(value)
    }
    return this.client.hsetAsync(key, field, value)
  }

  hget(key, field) {
    return this.client.hgetAsync(key, field)
  }

  hmset(key, field, value) {
    if (check.object(value)) {
      value = JSON.stringify(value)
    }
    return this.client.hmsetAsync(key, field, value)
  }

  hmget(key, field) {
    return this.client.hmgetAsync(key, field)
    .then(result=>{
      if (check.array(result)) {
        return result[0]
      }
      return result
    })
  }

  hmgetAsync(key) {
    return this.client.hgetallAsync(key)
  }

  hgetAll(key) {
    return this.client.hgetallAsync(key)
  }

  hremove(key, field) {
    return new Q((yes, no) => {
      this.client.hdel(key, field, (err, success) => {
        if (err) {
          no(err)
        } else {
          yes(success)
        }
      })
    })
  }
  del(key) {
    console.log("del()");
    return this.client.delAsync(key)
  }

  //TOODO in remote_Api
  lrange(key, start, end) {
    return this.client.lrangeAsync(key, start, end)
  }
  rpush(key, value) {
    return this.client.rpushAsync(key, value)
  }
  sadd(key, value) {
    return this.client.saddAsync(key, value)
  }
  smembers(key) {
    return this.client.smembersAsync(key)
  }
}

module.exports = REDIS_API
