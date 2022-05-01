const router = require('express').Router();
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const Config = require('../models/config.model');
const { uploadConfig, deleteConfig, deleteConfigs } = require('../utils/configs');
const { getActive } = require('../processor/lineDetection');
const { getJsonValue } = require('../utils/redis');

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
//                                           New Config
// =================================================================================================

router.route('/').post(async (req, res) => {
  if (req.isAuthenticated()) {
    const { matchId } = getActive(req.user._id);
    const config = await getJsonValue(`${matchId}-settings`);
    await uploadConfig(req.user._id, req.body.title, config);
    return res.sendStatus(200);
  }
  return res.sendStatus(403);
});

// =================================================================================================
//                                           Edit Config
// =================================================================================================

router.route('/:configId').post(async (req, res) => {
  if (req.isAuthenticated()) {
    if (req.body.duplicate) {
      const config = await Config.findById(req.params.configId);
      await uploadConfig(req.user._id, req.body.changes.title, config.config);
      return res.sendStatus(200);
    }
    await Config.findByIdAndUpdate(req.params.configId, req.body.changes);
    return res.sendStatus(200);
  }
  return res.sendStatus(403);
});

// =================================================================================================
//                                         Delete Config
// =================================================================================================

router.route('/').delete(async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      await deleteConfigs(req.body.configIds);
      return res.sendStatus(200);
    } catch (err) {
      return res.sendStatus(500);
    }
  }
  return res.sendStatus(403);
});

router.route('/:configId').delete(async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      await deleteConfig(req.params.configId);
      return res.sendStatus(200);
    } catch (err) {
      return res.sendStatus(500);
    }
  }
  return res.sendStatus(403);
});

module.exports = router;
