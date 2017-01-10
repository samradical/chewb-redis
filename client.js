const redis = require('redis');
const RemoteApi = require('./remote_api');

const Client = function(options, local) {
  if (local) {
    let client = redis.createClient();
    client.on("error", (err) => {
      console.log("Error " + err);
    });
    console.log("Created local client");
    return client
  } else {
    return RemoteApi(options)
  }
}


module.exports = Client
