const { createClient } = require('redis');

let client;

exports.redisConnection = async () => {
  client = createClient({
    url: `redis://${process.env.REDIS}`,
  });
  await client.connect();
  console.info(`Redis connection established successfully on ${process.env.REDIS}`);
};

exports.redisDisconnect = async () => client.quit();

exports.setValue = async (key, value) => client.set(key, value);

exports.getValue = async (key) => client.get(key);

exports.delValue = async (key) => client.del(key);

exports.setJsonValue = async (key, value) => client.json.set(`${key}:jsondata`, '$', value);

exports.getJsonValue = async (key) => client.json.get(`${key}:jsondata`, '$');

exports.delJsonValue = async (key) => client.del(`${key}:jsondata`);
