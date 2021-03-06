const mongoose = require('mongoose');
const { RateLimiterMongo } = require('rate-limiter-flexible');
const { systemLogger: logger } = require('../utils/logger');

const { connection } = mongoose;

const rateLimiter = new RateLimiterMongo({
  storeClient: connection,
  tableName: 'rateLimits',
  points: 50,
  duration: 1
});

const rateLimiterMiddleware = (req, res, next) => {
  rateLimiter.consume(req.ip)
    .then(() => {
      next();
    })
    .catch((e) => {
      if (e.remainingPoints === 0) {
        logger.log({
          level: 'warn',
          message: 'Too Many Requests',
          metadata: {
            userId: req?.user?._id.toString(),
            userEmail: req?.user?.email,
            path: req.path,
            body: req.body,
            query: req.query,
            params: req.params,
            ip: req.ip
          }
        });
        return res.status(429).send('Too Many Requests');
      }
      console.log(e);
      next();
    });
};

module.exports = rateLimiterMiddleware;
