const Redis = require('./index');

let isLocal = process.env.REDIS_HOST === '127.0.0.1'

const R =  new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT || '6379',
}, true)


R.user.storeVideo("test", {id:"test"})
R.youtube.getSidx("video_id:140").then(d=>console.log(d))
//R.youtube.setSidx("video_id:140", {id:"test",info:{}})
