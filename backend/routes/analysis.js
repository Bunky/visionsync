const router = require('express').Router();
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const {
  startAnalysis, getActive, isActive, stopAnalysis
} = require('../processor/lineDetection');

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
router.route('/').get(async (req, res) => {
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
