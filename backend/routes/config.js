const router = require('express').Router();
const _ = require('lodash');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const User = require('../models/user.model');
const { getActive } = require('../processor/lineDetection');
const { setJsonValue, getJsonValue } = require('../utils/redis');
const validation = require('../middleware/validation/validation');
const { config: configSchemas } = require('../middleware/validation/schemas');
const { catchErrors } = require('../middleware/errorHandler');

// =================================================================================================
//                                           Return Config
// =================================================================================================

router.route('/').get(catchErrors(async (req, res) => {
  const active = getActive(req.user._id);
  if (active) {
    return res.status(200).send(await getJsonValue(`${active.matchId}-settings`));
  }
  const user = await User.findById(req.user._id);
  return res.status(200).send(user.settings);
}));

// =================================================================================================
//                                           Update Config
// =================================================================================================

router.route('/').post(validation(configSchemas.edit, 'body'), catchErrors(async (req, res) => {
  const active = getActive(req.user._id);
  if (active) {
    const currentSettings = await getJsonValue(`${active.matchId}-settings`);
    const newSettings = _.merge(currentSettings, req.body);

    await setJsonValue(`${active.matchId}-settings`, newSettings);
    return res.sendStatus(200);
  }
  const user = await User.findById(req.user._id);
  user.settings = _.merge(user.settings, req.body);

  await user.save();
  return res.sendStatus(200);
}));

module.exports = router;
