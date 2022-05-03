const { systemLogger: logger } = require('../utils/logger');

const catchErrors = (cb) => (req, res, next) => cb(req, res, next).catch(next);

const errorHandler = (err, req, res, next) => {
  logger.log({
    level: 'error',
    message: err.message,
    metadata: {
      userId: req?.user?._id.toString(),
      userEmail: req?.user?.email,
      path: req.path,
      body: req.body,
      query: req.query,
      params: req.params,
      stack: err.stack
    }
  });

  return res.status(500).json({
    error: err.message
  });
};

module.exports = { catchErrors, errorHandler };
