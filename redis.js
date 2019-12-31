var redis = require('redis');
var url = require('url');
var redisURL = url.parse(process.env.REDIS_SERVER);
console.log(url)
module.exports = function(){
  return redis.createClient(redisURL.port, redisURL.hostname, { return_buffers: true });
};