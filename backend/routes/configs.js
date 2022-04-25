const router = require('express').Router();
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const Config = require('../models/config.model');
const { uploadConfig, deleteConfig } = require('../utils/configs');

// =================================================================================================
//                                           Upload Config
// =================================================================================================

router.route('/upload').post(async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const {
        ownerId, title, data
      } = req.body;
      await uploadConfig(ownerId, title, data);
      return res.sendStatus(200);
    } catch (err) {
      return res.sendStatus(500);
    }
  }
  return res.sendStatus(403);
});

// =================================================================================================
//                                           Get Configs
// =================================================================================================

router.route('/').get(async (req, res) => {
  if (req.isAuthenticated()) {
    const configs = await Config.find({ ownerId: req.user._id }, {
      ownerId: 0, __v: 0
    });
    return res.status(200).send(configs);
  }
  return res.sendStatus(403);
});

// =================================================================================================
//                                         Delete Config
// =================================================================================================

router.route('/').delete(async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      await deleteConfig(req.body.configId);
      return res.sendStatus(200);
    } catch (err) {
      return res.sendStatus(500);
    }
  }
  return res.sendStatus(403);
});

module.exports = router;
