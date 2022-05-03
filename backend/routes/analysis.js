const router = require('express').Router();
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const {
  startAnalysis, getActive, stopAnalysis
} = require('../processor/lineDetection');
const Analysis = require('../models/analysis.model');
const { uploadAnalysis, deleteAnalysis, deleteAnalyses } = require('../components/analysis');
const validation = require('../middleware/validation/validation');
const { analysis: analysisSchemas } = require('../middleware/validation/schemas');
const { catchErrors } = require('../middleware/errorHandler');

// =================================================================================================
//                                           Upload Analysis
// =================================================================================================

router.route('/upload').post(validation(analysisSchemas.upload, 'body'), catchErrors(async (req, res) => {
  const {
    matchId, ownerId, data, settings
  } = req.body;
  await uploadAnalysis(matchId, ownerId, data, settings);
  return res.sendStatus(200);
}));

// =================================================================================================
//                                           Get Analysis
// =================================================================================================

router.route('/').get(catchErrors(async (req, res) => {
  const analyses = await Analysis.find({ ownerId: req.user._id }, {
    ownerId: 0, settings: 0, __v: 0
  });
  return res.status(200).send(analyses);
}));

// =================================================================================================
//                                         Delete Analysis
// =================================================================================================

router.route('/').delete(validation(analysisSchemas.deleteMultiple, 'body'), catchErrors(async (req, res) => {
  await deleteAnalyses(req.body.analysisIds);
  return res.sendStatus(200);
}));

router.route('/:analysisId').delete(validation(analysisSchemas.delete, 'params'), catchErrors(async (req, res) => {
  await deleteAnalysis(req.params.analysisId);
  return res.sendStatus(200);
}));

// =================================================================================================
//                                        Analysis Controls
// =================================================================================================

// Start analysis
router.route('/start').post(validation(analysisSchemas.start, 'body'), catchErrors(async (req, res) => {
  await startAnalysis(req.user._id.toString(), req.body.matchId);
  return res.sendStatus(200);
}));

// Stop analysis
router.route('/stop').post(validation(analysisSchemas.stop, 'body'), catchErrors(async (req, res) => {
  await stopAnalysis(req.body.matchId);
  return res.sendStatus(200);
}));

// Check if running
router.route('/current').get(catchErrors(async (req, res) => {
  const active = getActive(req.user._id);
  if (active) {
    return res.status(200).send({ active: true, matchId: active.matchId });
  }
  return res.status(200).send({ active: false });
}));

module.exports = router;
