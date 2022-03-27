const { createClient } = require('redis');

let client;

exports.redisConnection = async () => {
  client = createClient({
    url: `redis://${process.env.REDIS}`
  });
  await client.connect();
  console.info(`Redis connection established successfully on ${process.env.REDIS}`);
};

exports.redisDisconnect = async () => {
  client.quit();
};

exports.setValue = async (key, value) => {
  await client.set(key, value);
};

exports.getValue = async (key) => {
  return await client.get(key);
};

exports.delValue = async (key) => {
  await client.del(key);
};

exports.setJsonValue = async (key, value) => {
  await client.json.set(`${key}:jsondata`, '$', value);
};

exports.getJsonValue = async (key) => {
  return await client.json.get(`${key}:jsondata`, '$');
};

exports.delJsonValue = async (key) => {
  client.del(`${key}:jsondata`);
};

