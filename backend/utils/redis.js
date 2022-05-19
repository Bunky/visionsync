const { createClient } = require('redis');
const { redisLogger: logger } = require('./logger');

let client;
exports.redisConnection = async () => {
  client = createClient({
    url: `redis://${process.env.REDIS}`,
  });

  client.on('error', (err) => logger.log({
    level: 'error',
    message: 'Redis Client Error',
    metadata: {
      stack: err.stack
    }
  }));

  await client.connect();
  logger.info(`Redis connection established successfully on ${process.env.REDIS}`);
};

exports.redisDisconnect = async () => client.quit();

exports.setValue = async (key, value) => client.set(key, value);

exports.getValue = async (key) => client.get(key);

exports.delValue = async (key) => client.del(key);

exports.setJsonValue = async (key, value) => client.json.set(`${key}:jsondata`, '$', value);

exports.getJsonValue = async (key) => client.json.get(`${key}:jsondata`, '$');

exports.delJsonValue = async (key) => client.del(`${key}:jsondata`);
