const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const Config = require('../models/config.model');

// =================================================================================================
//                                           Upload Config
// =================================================================================================

exports.uploadConfig = (ownerId, title, data) => new Promise(async (resolve, reject) => {
  try {
    const newConfig = new Config({
      ownerId,
      title,
      config: data,
    });
    await newConfig.save();
    resolve();
  } catch (err) {
    reject(err);
  }
});

// =================================================================================================
//                                           Delete Config
// =================================================================================================

exports.deleteConfig = (configId) => new Promise(async (resolve, reject) => {
  try {
    await Config.findByIdAndDelete(configId);
    resolve();
  } catch (err) {
    reject(err);
  }
});

exports.deleteConfigs = (configIds) => new Promise(async (resolve, reject) => {
  try {
    await Config.deleteMany({
      _id: {
        $in: configIds
      }
    });
    resolve();
  } catch (err) {
    reject(err);
  }
});
