const router = require('express').Router();
const _ = require('lodash');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const User = require('../models/user.model');
const { isActive } = require("../processor/lineDetection");
const { setJsonValue, getJsonValue } = require('../utils/redis');

// =================================================================================================
//                                           Return Config
// =================================================================================================

router.route('/').get(async (req, res) => {
  if (req.isAuthenticated()) {
    if (isActive(req.user._id)) {
      return res.status(200).send(await getJsonValue(req.user._id.toString()));
    } else {
      const user = await User.findById(req.user._id);
      return res.status(200).send(user.settings);
    }
  } else {
    return res.status(200).send({ unauthorised: true });
  }
});

// =================================================================================================
//                                           Update Config
// =================================================================================================

router.route('/').post(async (req, res) => {
  if (req.isAuthenticated()) {
    if (isActive(req.user._id)) {
      const currentSettings = await getJsonValue(req.user._id.toString());
      const newSettings = _.merge(currentSettings, req.body);

      await setJsonValue(req.user._id.toString(), newSettings);
      return res.status(200).send(newSettings);
    } else {
      let user = await User.findById(req.user._id);   
      user.settings = _.merge(settings, req.body);
  
      await user.save();
      return res.status(200).send(user.settings);
    }
  } else {
    return res.status(200).send({ unauthorised: true });
  }
});

module.exports = router;
