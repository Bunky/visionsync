const router = require('express').Router();
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const {
  startAnalysis, getActive, stopAnalysis
} = require('../processor/lineDetection');
const Analysis = require('../models/analysis.model');
const { uploadAnalysis, deleteAnalysis, deleteAnalyses } = require('../utils/analysis');

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
      await deleteAnalyses(req.body.analysisIds);
      return res.sendStatus(200);
    } catch (err) {
      return res.sendStatus(500);
    }
  }
  return res.sendStatus(403);
});

router.route('/:analysisId').delete(async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      await deleteAnalysis(req.params.analysisId);
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
router.route('/start').post((req, res) => {
  if (req.isAuthenticated()) {
    // Check user has access to match
    startAnalysis(req.user._id.toString(), req.body.matchId);
    return res.status(200).send({ active: true });
  }
  return res.sendStatus(403);
});

// Stop analysis
router.route('/stop').post((req, res) => {
  if (req.isAuthenticated()) {
    stopAnalysis(req.body.matchId);
    return res.status(200).send({ active: false });
  }
  return res.sendStatus(403);
});

// Check if running
router.route('/current').get((req, res) => {
  if (req.isAuthenticated()) {
    const active = getActive(req.user._id);
    if (active) {
      return res.status(200).send({ active: true, matchId: active.matchId });
    }
    return res.status(200).send({ active: false });
  }
  return res.sendStatus(403);
});

module.exports = router;
