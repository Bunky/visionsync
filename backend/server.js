const http = require('http');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoSessionStore = require('connect-mongo');
require('dotenv').config();
const fileUpload = require('express-fileupload');
const cors = require('cors');
const { socketConnection } = require('./utils/socket-io');
const { redisConnection } = require('./utils/redis');
const { systemLogger: log } = require('./utils/logger');
const authenticate = require('./middleware/authenticate');
const { errorHandler } = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

// =================================================================================================
//                                       Web Server Configuration
// =================================================================================================

const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cors({
  credentials: true,
  origin: process.env.NODE_ENV !== 'development' ? 'https://visionsync.ben-charles.com' : true
}));

if (process.env.NODE_ENV !== 'development') {
  app.set('trust proxy', true);
}
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: process.env.NODE_ENV !== 'development',
  cookie: {
    maxAge: 60000 * 60 * 6,
    secure: process.env.NODE_ENV !== 'development',
    httpOnly: true,
    sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'lax',
    domain: process.env.NODE_ENV !== 'development' ? 'visionsync.ben-charles.com' : undefined
  },
  store: MongoSessionStore.create({
    mongoUrl: process.env.MONGOURL,
    stringify: false,
    touchAfter: 2 * 3600
  })
}));

// =================================================================================================
//                                                Redis
// =================================================================================================

redisConnection();

// =================================================================================================
//                                               SocketIO
// =================================================================================================

socketConnection(server);

// =================================================================================================
//                                       PassportJS Configuration
// =================================================================================================

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// =================================================================================================
//                                            API Routes
// =================================================================================================

app.use(rateLimiter);
app.all('*', authenticate);

app.use('/user', require('./routes/user'));
app.use('/config', require('./routes/config'));
app.use('/analysis', require('./routes/analysis'));
app.use('/matches', require('./routes/matches'));
app.use('/configs', require('./routes/configs'));

app.route('/health').get((req, res) => res.sendStatus(200));

app.use(errorHandler);

// =================================================================================================
//                                           MongoAtlas Config
// =================================================================================================

mongoose.connect(process.env.MONGOURL, {
  useNewUrlParser: true, useUnifiedTopology: true,
});
const { connection } = mongoose;
connection.once('open', () => {
  log.info('MongoDB Atlas database connection established successfully!');
});

// =================================================================================================
//                                           Web Server Init
// =================================================================================================

server.listen(process.env.PORT, (err) => {
  if (err) {
    log.error('Error launching web server', err);
    throw err;
  }
  log.info(`Web Server ready on http://localhost:${process.env.PORT}`);
});
