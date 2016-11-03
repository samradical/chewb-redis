const client = require('./client');
const redis = require('redis');
const _ = require('lodash');
const Q = require('bluebird');

Q.promisifyAll(redis.RedisClient.prototype);
Q.promisifyAll(redis.Multi.prototype);

class REDIS_API {

  constructor(options = {}, local = true) {
    this.client = client(options, local)
    this.projectKey = options.project || ""
  }

  _prependProjectKey(str) {
    return `${this.projectKey}:${str}`
  }

  hset(key, field, value) {
    return this.client.hsetAsync(key, field, value)
  }

  hget(key) {
    return this.client.hgetallAsync(key)
  }

  hmset(key, value) {
    return this.client.hmsetAsync(key, value)
  }
  hmget(key) {
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
