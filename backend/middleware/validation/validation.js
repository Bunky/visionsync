const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const validation = (schema, property) => (req, res, next) => {
  const { error } = schema.validate(req[property]);
  if (!error) {
    next();
  } else {
    const { details } = error;
    const message = details.map((i) => i.message).join(',');
    return res.status(400).json({ error: message });
  }
};

module.exports = validation;
