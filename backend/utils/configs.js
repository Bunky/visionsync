const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const AWS = require('aws-sdk');
const Config = require('../models/config.model');

// aws stuff
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
});
AWS.config.update({
  region: 'us-east-2',
});

// =================================================================================================
//                                           Upload Config
// =================================================================================================

exports.uploadConfig = (ownerId, title, data) => new Promise(async (resolve, reject) => {
  const newConfig = new Config({
    ownerId,
    title,
    config: data,
  });
  const config = await newConfig.save();

  try {
    const s3Response = await s3.upload({
      Bucket: process.env.AWS_BUCKET,
      Key: `configs/${config._id}.json`,
      Body: JSON.stringify(data),
      ContentType: 'application/json'
    }).promise();

    resolve(s3Response);
  } catch (err) {
    console.log(err);
    await Config.findByIdAndDelete(config._id);
    reject(err);
  }
});

// =================================================================================================
//                                           Delete Config
// =================================================================================================

exports.deleteConfig = (configId) => new Promise(async (resolve, reject) => {
  await Config.findByIdAndDelete(configId);

  try {
    // Deleting files from the bucket
    const s3Response = s3.deleteObject({
      Bucket: process.env.AWS_BUCKET,
      Key: `configs/${configId}.json`
    }).promise();

    resolve(s3Response);
  } catch (err) {
    reject(err);
  }
});

exports.deleteConfigs = (configIds) => new Promise(async (resolve, reject) => {
  await Config.deleteMany({
    _id: {
      $in: configIds
    }
  });

  try {
    // Deleting files from the bucket
    await s3.deleteObjects({
      Bucket: process.env.AWS_BUCKET,
      Delete: {
        Objects: configIds.map((configId) => ({ Key: `configs/${configId}.json` })),
        Quiet: false
      }
    }).promise();

    resolve();
  } catch (err) {
    reject(err);
  }
});
