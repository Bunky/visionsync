const router = require('express').Router();
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const Match = require('../models/match.model');
const { uploadMatch, deleteMatch, deleteMatches } = require('../components/matches');
const { systemLogger: log } = require('../utils/logger');

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
      log.error('Error uploading match', {
        userId: req.user._id,
        userEmail: req.user.email,
        err
      });
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
    }).limit(100);
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
      log.error('Error deleting matches', {
        userId: req.user._id,
        userEmail: req.user.email,
        matchIds: req.body.matchIds,
        err
      });
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
      log.error('Error deleting match', {
        userId: req.user._id,
        userEmail: req.user.email,
        matchId: req.params.matchId,
        err
      });
      return res.sendStatus(500);
    }
  }
  return res.sendStatus(403);
});

module.exports = router;
