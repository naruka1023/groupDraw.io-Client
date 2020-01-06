var redis = require('redis');
url = process.env.REDISCLOUD_URL
module.exports = function(){
  client = redis.createClient(redisURL.port, redisURL.hostname, { return_buffers: true });
  client.auth(redisURL.auth.split(":")[1]);
  return client
};