const { createClient } = require('redis');
const { redisLogger: log } = require('./logger');

let client;
exports.redisConnection = async () => {
  client = createClient({
    url: `redis://${process.env.REDIS}`,
  });

  client.on('error', (err) => log.fatal('Redis Client Error', err));

  await client.connect();
  log.info(`Redis connection established successfully on ${process.env.REDIS}`);
};

exports.redisDisconnect = async () => client.quit();

exports.setValue = async (key, value) => client.set(key, value);

exports.getValue = async (key) => client.get(key);

exports.delValue = async (key) => client.del(key);

exports.setJsonValue = async (key, value) => client.json.set(`${key}:jsondata`, '$', value);

exports.getJsonValue = async (key) => client.json.get(`${key}:jsondata`, '$');

exports.delJsonValue = async (key) => client.del(`${key}:jsondata`);
