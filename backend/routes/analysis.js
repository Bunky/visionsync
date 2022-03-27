const router = require('express').Router();
const _ = require('lodash');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const User = require('../models/user.model');
const { startAnalysis, isActive, stopAnalysis } = require("../processor/lineDetection");

// =================================================================================================
//                                        Analysis Controls
// =================================================================================================

// Start analysis
router.route('/start').post(async (req, res) => {
  if (req.isAuthenticated()) {
    startAnalysis(req.user._id);
    return res.status(200).send({ active: true });
  } else {
    return res.status(200).send({ unauthorised: true });
  }
});

// Stop analysis
router.route('/stop').post(async (req, res) => {
  if (req.isAuthenticated()) {
    stopAnalysis(req.user._id);
    return res.status(200).send({ active: false });
  } else {
    return res.status(200).send({ unauthorised: true });
  }
});

// Check if running
router.route('/').get(async (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).send({ active: isActive(req.user._id) });
  } else {
    return res.status(200).send({ unauthorised: true });
  }
});

module.exports = router;
