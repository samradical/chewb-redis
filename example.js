const { youtube } = require('@samelie/chewb-redis');

let isLocal = process.env.REDIS_HOST === '127.0.0.1'

return new youtube({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT || '6379',
}, isLocal)
