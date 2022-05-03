const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const schemas = {
  auth: {
    signup: Joi.object({
      email: Joi.string()
        .email()
        .required(),
      firstName: Joi.string()
        .min(2)
        .max(32)
        .alphanum()
        .required(),
      lastName: Joi.string()
        .min(2)
        .max(32)
        .alphanum()
        .required(),
      password: Joi.string()
        .min(8)
        .max(64)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .required(),
      termsOfService: Joi.boolean()
        .required(),
    }),

    login: Joi.object({
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string()
        .min(0)
        .max(64)
        .required(),
    }),

    email: Joi.object({
      email: Joi.string()
        .email()
        .required(),
    }),
  },

  matches: {
    upload: Joi.object({
      title: Joi.string()
        .min(3)
        .max(35)
        .required(),
      configId: Joi.string()
        .min(0)
        .max(64)
        .required(),
    }),

    edit: Joi.object({
      matchId: Joi.objectId()
        .required()
    }),

    editBody: Joi.object({
      changes: Joi.object({
        title: Joi.string()
          .min(3)
          .max(35)
      }).required()
    }),

    deleteMultiple: Joi.object({
      matchIds: Joi.array()
        .items(Joi.objectId())
        .min(1)
        .required()
    }),

    delete: Joi.object({
      matchId: Joi.objectId()
        .required()
    })
  },

  configs: {
    upload: Joi.object({
      title: Joi.string()
        .min(3)
        .max(35)
        .required()
    }),

    edit: Joi.object({
      configId: Joi.objectId()
        .required()
    }),

    editBody: Joi.object({
      duplicate: Joi.boolean(),
      changes: Joi.object({
        title: Joi.string()
          .min(3)
          .max(35)
      }).required()
    }),

    deleteMultiple: Joi.object({
      configIds: Joi.array()
        .items(Joi.objectId())
        .min(1)
        .required()
    }),

    delete: Joi.object({
      configId: Joi.objectId()
        .required()
    })
  },

  config: {
    edit: Joi.object().required()
  },

  analysis: {
    upload: Joi.object({
      matchId: Joi.objectId()
        .required(),
      ownerId: Joi.objectId()
        .required(),
      data: Joi.object()
        .required(),
      settings: Joi.object()
        .required()
    }),

    deleteMultiple: Joi.object({
      analysisIds: Joi.array()
        .items(Joi.objectId())
        .min(1)
        .required()
    }),

    delete: Joi.object({
      analysisId: Joi.objectId()
        .required()
    }),

    start: Joi.object({
      matchId: Joi.objectId()
        .required()
    }),

    stop: Joi.object({
      matchId: Joi.objectId()
        .required()
    })
  }

};

module.exports = schemas;
