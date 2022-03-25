const router = require('express').Router();
const _ = require('lodash');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const User = require('../models/user.model');
const defaultSettings = require('../processor/defaultSettings.json');

// =================================================================================================
//                                           Return Config
// =================================================================================================

global.settings = defaultSettings;

// =================================================================================================
//                                           Return Config
// =================================================================================================

router.route('/').get(async (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).send(defaultSettings);
  } else {
    return res.status(200).send({ unauthorised: true });
  }
});

// =================================================================================================
//                                           Update Config
// =================================================================================================

router.route('/').post(async (req, res) => {
  if (req.isAuthenticated()) {
    const newSettings = _.merge(settings, req.body);
    settings = newSettings;
    return res.status(200).send(newSettings);
  } else {
    return res.status(200).send({ unauthorised: true });
  }
});

module.exports = router;
