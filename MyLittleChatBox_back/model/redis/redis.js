/**
 * Redis helper functions
 */
const config = require('../../config/dbconfig');
const Redis = require('ioredis');
const redis = new Redis(config.redis);
const pub = new Redis(config.redis);


// const RedisClustr = require('redis-clustr');
// const RedisClient = require('redis');
//
// const redis = new RedisClustr({
//   servers: config.redis,
//   createClient: function(port, host){
//     console.log('config.redis: ' + port + ', ' + host);
//     return RedisClient.createClient(port, host, {detect_buffers: true});
//   }
// })

const assert = require('assert');
// let cluster = [
//         {name: 'redis01', link: '172.16.9.198:6379', slots: [0,8191]},
//         {name: 'redis02', link: '172.16.9.218:6379', slots: [8192,16384]}
// ];
//
// const redis = require('redis-cluster').poorMansClusterClient(cluster);

//console.log('config.redis = ' + JSON.stringify(config.redis));
// console.log("---------------------");
// console.log(redis);
// console.log("---------------------");
// redis.set('foo', 'bar', function (err, reply) {
//   if (err) throw err;
//   assert.equal(reply,'OK');
//
//   redis.get('foo', function (err, reply) {
//     if (err) throw err;
//     assert.equal(reply, 'bar');
//   });
// });

//redis.on('error', (err) => {
//  console.log('error event - ' + config.redis.host + ':' + config.redis.port + ' - ' + err);
//});

module.exports = {
  redis: redis,
  pub : pub,
  doRelease: () => {
    redis.disconnect();
  }
}
