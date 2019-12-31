var redis = require('redis');
url = process.env.REDIS_SERVER
console.log(url)
module.exports = function(){
  return redis.createClient(url.toString(), { return_buffers: true });
};