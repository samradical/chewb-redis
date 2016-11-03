const redis = require('redis');
const RemoteApi = require('./remote_api');

const Client = function(options, local = true) {
  if (local) {
    let client = redis.createClient(options);
    client.on("error", (err) => {
      console.log("Error " + err);
    });
    return client
  } else {
    return RemoteApi(options)
  }
}


module.exports = Client