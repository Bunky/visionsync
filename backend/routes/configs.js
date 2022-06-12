const router = require('express').Router();
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const Config = require('../models/config.model');
const { uploadConfig, deleteConfig, deleteConfigs } = require('../components/configs');
const { getActive } = require('../processor/analysis');
const { getJsonValue } = require('../utils/redis');
const validation = require('../middleware/validation/validation');
const { configs: configSchemas } = require('../middleware/validation/schemas');
const { catchErrors } = require('../middleware/errorHandler');

// =================================================================================================
//                                           New Config
// =================================================================================================

router.route('/').post(validation(configSchemas.upload, 'body'), catchErrors(async (req, res) => {
  const { matchId } = getActive(req.user._id);
  const config = await getJsonValue(`${matchId}-settings`);
  await uploadConfig(req.user._id, req.body.title, config);
  return res.sendStatus(200);
}));

// =================================================================================================
//                                           Get Configs
// =================================================================================================

router.route('/').get(catchErrors(async (req, res) => {
  const configs = await Config.find({ ownerId: req.user._id }, {
    ownerId: 0, __v: 0
  });
  return res.status(200).send(configs);
}));

// =================================================================================================
//                                           Edit Config
// =================================================================================================

router.route('/:configId').post(
  validation(configSchemas.edit, 'params'),
  validation(configSchemas.editBody, 'body'),
  catchErrors(async (req, res) => {
    if (req.body.duplicate) {
      const config = await Config.findById(req.params.configId);
      await uploadConfig(req.user._id, req.body.changes.title, config.config);
      return res.sendStatus(200);
    }
    await Config.findByIdAndUpdate(req.params.configId, req.body.changes);
    return res.sendStatus(200);
  })
);

// =================================================================================================
//                                         Delete Config
// =================================================================================================

router.route('/').delete(validation(configSchemas.deleteMultiple, 'body'), catchErrors(async (req, res) => {
  await deleteConfigs(req.body.configIds);
  return res.sendStatus(200);
}));

router.route('/:configId').delete(validation(configSchemas.delete, 'params'), catchErrors(async (req, res) => {
  await deleteConfig(req.params.configId);
  return res.sendStatus(200);
}));

module.exports = router;
