const router = require('express').Router();
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const Match = require('../models/match.model');
const { uploadMatch, deleteMatch, deleteMatches } = require('../utils/matches');

// =================================================================================================
//                                           Upload Match
// =================================================================================================

router.route('/upload').post(async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const {
        title, configId
      } = req.body;
      await uploadMatch(req.user._id.toString(), title, configId, req.files.match.data);
      return res.sendStatus(200);
    } catch (err) {
      return res.sendStatus(500);
    }
  }
  return res.sendStatus(403);
});

// =================================================================================================
//                                           Get Matches
// =================================================================================================

router.route('/').get(async (req, res) => {
  if (req.isAuthenticated()) {
    const matches = await Match.find({ ownerId: req.user._id }, {
      ownerId: 0, settings: 0, __v: 0
    });
    return res.status(200).send(matches);
  }
  return res.sendStatus(403);
});

// =================================================================================================
//                                           Edit Match
// =================================================================================================

router.route('/:matchId').post(async (req, res) => {
  if (req.isAuthenticated()) {
    const match = await Match.findByIdAndUpdate(req.params.matchId, req.body);
    return res.status(200).send(match);
  }
  return res.sendStatus(403);
});

// =================================================================================================
//                                         Delete Match
// =================================================================================================

router.route('/').delete(async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      await deleteMatches(req.body.matchIds);
      return res.sendStatus(200);
    } catch (err) {
      return res.sendStatus(500);
    }
  }
  return res.sendStatus(403);
});

router.route('/:matchId').delete(async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      await deleteMatch(req.params.matchId);
      return res.sendStatus(200);
    } catch (err) {
      return res.sendStatus(500);
    }
  }
  return res.sendStatus(403);
});

module.exports = router;
