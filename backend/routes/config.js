const router = require('express').Router();
const _ = require('lodash');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const User = require('../models/user.model');
const { isActive, getActive } = require('../processor/lineDetection');
const { setJsonValue, getJsonValue } = require('../utils/redis');

// =================================================================================================
//                                           Return Config
// =================================================================================================

router.route('/').get(async (req, res) => {
  if (req.isAuthenticated()) {
    if (isActive(req.user._id)) {
      const active = getActive(req.user._id);
      return res.status(200).send(await getJsonValue(active.matchId));
    }
    const user = await User.findById(req.user._id);
    return res.status(200).send(user.settings);
  }
  return res.sendStatus(403);
});

// =================================================================================================
//                                           Update Config
// =================================================================================================

router.route('/').post(async (req, res) => {
  if (req.isAuthenticated()) {
    if (isActive(req.user._id)) {
      const active = getActive(req.user._id);

      const currentSettings = await getJsonValue(active.matchId);
      const newSettings = _.merge(currentSettings, req.body);

      await setJsonValue(active.matchId, newSettings);
      return res.status(200).send(newSettings);
    }
    const user = await User.findById(req.user._id);
    user.settings = _.merge(user.settings, req.body);

    await user.save();
    return res.status(200).send(user.settings);
  }
  return res.sendStatus(403);
});

module.exports = router;
