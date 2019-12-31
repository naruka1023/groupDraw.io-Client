var redis = require('redis');
url = process.env.REDIS_SERVER
module.exports = function(){
  return redis.createClient(url.toString(), { return_buffers: true });
};