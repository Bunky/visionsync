const winston = require('winston');
require('winston-mongodb');

const systemLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/systemLogs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/systemLogs/combined.log' }),
    new winston.transports.MongoDB({
      level: 'info',
      db: process.env.MONGO_LOGGER_URL,
      storeHost: true,
      options: {
        useUnifiedTopology: true
      },
      collection: 'systemLogs',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/systemLogs/exceptions.log' })
  ]
});

const userLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/userLogs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/userLogs/combined.log' }),
    new winston.transports.MongoDB({
      level: 'info',
      db: process.env.MONGO_LOGGER_URL,
      storeHost: true,
      options: {
        useUnifiedTopology: true
      },
      collection: 'userLogs',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/userLogs/exceptions.log' })
  ]
});

const socketLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/socketLogs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/socketLogs/combined.log' }),
    new winston.transports.MongoDB({
      level: 'info',
      db: process.env.MONGO_LOGGER_URL,
      storeHost: true,
      options: {
        useUnifiedTopology: true
      },
      collection: 'socketLogs',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/socketLogs/exceptions.log' })
  ]
});

const redisLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/redisLogs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/redisLogs/combined.log' }),
    new winston.transports.MongoDB({
      level: 'info',
      db: process.env.MONGO_LOGGER_URL,
      storeHost: true,
      options: {
        useUnifiedTopology: true
      },
      collection: 'redisLogs',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/redisLogs/exceptions.log' })
  ]
});

const analysisLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/analysisLogs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/analysisLogs/combined.log' }),
    new winston.transports.MongoDB({
      level: 'info',
      db: process.env.MONGO_LOGGER_URL,
      storeHost: true,
      options: {
        useUnifiedTopology: true
      },
      collection: 'analysisLogs',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/analysisLogs/exceptions.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  const consoleLogger = new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({
        all: true
      }),
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
      }),
      winston.format.printf(
        (info) => {
          if (info instanceof Error) {
            return `[${info.timestamp}] [${info.level}]: ${info.message} ${info.stack || info}`;
          }
          return `[${info.timestamp}] [${info.level}]: ${info.message}`;
        }
      )
    )
  });

  systemLogger.add(consoleLogger);
  userLogger.add(consoleLogger);
  socketLogger.add(consoleLogger);
  redisLogger.add(consoleLogger);
  analysisLogger.add(consoleLogger);
}

module.exports = {
  systemLogger, userLogger, socketLogger, redisLogger, analysisLogger
};
