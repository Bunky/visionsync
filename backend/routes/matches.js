const router = require('express').Router();
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const Match = require('../models/match.model');
const { uploadMatch, deleteMatch, deleteMatches } = require('../components/matches');
const validation = require('../middleware/validation/validation');
const { matches: matchSchemas } = require('../middleware/validation/schemas');
const { catchErrors } = require('../middleware/errorHandler');

// =================================================================================================
//                                           Upload Match
// =================================================================================================

router.route('/upload').post(validation(matchSchemas.upload, 'body'), catchErrors(async (req, res) => {
  const { title, configId } = req.body;
  await uploadMatch(req.user._id.toString(), title, configId, req.files.match.data);
  return res.sendStatus(200);
}));

// =================================================================================================
//                                           Get Matches
// =================================================================================================

router.route('/').get(catchErrors(async (req, res) => {
  const matches = await Match.find({ ownerId: req.user._id }, {
    ownerId: 0, settings: 0, __v: 0
  }).limit(100);
  return res.status(200).send(matches);
}));

// =================================================================================================
//                                           Edit Match
// =================================================================================================

router.route('/:matchId').post(validation(matchSchemas.edit, 'params'), validation(matchSchemas.editBody, 'body'), catchErrors(async (req, res) => {
  await Match.findByIdAndUpdate(req.params.matchId, req.body);
  return res.sendStatus(200);
}));

// =================================================================================================
//                                         Delete Match
// =================================================================================================

router.route('/').delete(validation(matchSchemas.deleteMultiple, 'body'), catchErrors(async (req, res) => {
  await deleteMatches(req.body.matchIds);
  return res.sendStatus(200);
}));

router.route('/:matchId').delete(validation(matchSchemas.delete, 'params'), catchErrors(async (req, res) => {
  await deleteMatch(req.params.matchId);
  return res.sendStatus(200);
}));

module.exports = router;
