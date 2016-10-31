const redis = require('redis');
const _ = require('lodash');
const Q = require('bluebird');

Q.promisifyAll(redis.RedisClient.prototype);
Q.promisifyAll(redis.Multi.prototype);

class REDIS_API {

    constructor(options = {}) {
      this.client = redis.createClient(options);
      this.client.on("error", (err) => {
        console.log("Error " + err);
      });
    }

    hmset(key, value) {
      console.log(key, value);

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
    del(key){
      return this.client.delAsync(key)
    }
    rpush(key, value) {
      return this.client.rpushAsync(key, value)
    }
    sadd(key, value) {
      return this.client.saddAsync(key, value)
    }
    smembers(key){
      return this.client.smembersAsync(key)
    }
  }

  module.exports = REDIS_API