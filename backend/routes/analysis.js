const router = require('express').Router();
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const AWS = require('aws-sdk');
const {
  startAnalysis, getActive, isActive, stopAnalysis
} = require('../processor/lineDetection');
const Analysis = require('../models/analysis.model');
const { uploadAnalysis, deleteAnalysis } = require('../utils/analysis');

// aws stuff
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
});
AWS.config.update({
  region: 'us-east-2',
});

// =================================================================================================
//                                           Upload Analysis
// =================================================================================================

router.route('/upload').post(async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const {
        matchId, ownerId, data, settings
      } = req.body;
      await uploadAnalysis(matchId, ownerId, data, settings);

      return res.sendStatus(200);
    } catch (err) {
      return res.sendStatus(500);
    }
  }
  return res.sendStatus(403);
});

// =================================================================================================
//                                           Get Analysis
// =================================================================================================

router.route('/').get(async (req, res) => {
  if (req.isAuthenticated()) {
    const analyses = await Analysis.find({ ownerId: req.user._id }, {
      ownerId: 0, settings: 0, __v: 0
    });
    return res.status(200).send(analyses);
  }
  return res.sendStatus(403);
});

// =================================================================================================
//                                         Delete Analysis
// =================================================================================================

router.route('/').delete(async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      await deleteAnalysis(req.body.analysisId);
      return res.sendStatus(200);
    } catch (err) {
      return res.sendStatus(500);
    }
  }
  return res.sendStatus(403);
});

// =================================================================================================
//                                        Analysis Controls
// =================================================================================================

// Start analysis
router.route('/start').post(async (req, res) => {
  if (req.isAuthenticated()) {
    // Check user has access to match
    startAnalysis(req.user._id.toString(), req.body.matchId);
    return res.status(200).send({ active: true });
  }
  return res.sendStatus(403);
});

// Stop analysis
router.route('/stop').post(async (req, res) => {
  if (req.isAuthenticated()) {
    stopAnalysis(req.body.matchId);
    return res.status(200).send({ active: false });
  }
  return res.sendStatus(403);
});

// Check if running
router.route('/current').get(async (req, res) => {
  if (req.isAuthenticated()) {
    if (isActive(req.user._id)) {
      const active = getActive(req.user._id);
      return res.status(200).send({ active: true, matchId: active.matchId });
    }
    return res.status(200).send({ active: false });
  }
  return res.sendStatus(403);
});

module.exports = router;
