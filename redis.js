var redis = require('redis');
url = process.env.REDISCLOUD_URL
module.exports = function(){
  client = redis.createClient(url, { return_buffers: true });
  return client
};