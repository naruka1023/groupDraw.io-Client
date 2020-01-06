var redis = require('redis');
url = require('url')
var redisURL = url.parse(process.env.REDISCLOUD_URL);

module.exports = function(){
  var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
  console.log('workeds')
  return client
};