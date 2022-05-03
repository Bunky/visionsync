const http = require('http');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoSessionStore = require('connect-mongo');
require('dotenv').config();
const fileUpload = require('express-fileupload');
const { socketConnection } = require('./utils/socket-io');
const { redisConnection } = require('./utils/redis');
const { systemLogger: log } = require('./utils/logger');
const authenticate = require('./middleware/authenticate');
const { errorHandler } = require('./middleware/errorHandler');

// =================================================================================================
//                                       Web Server Configuration
// =================================================================================================

const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  secure: process.env.NODE_ENV !== 'development',
  proxy: process.env.NODE_ENV !== 'development',
  cookie: {
    maxAge: 60000 * 60 * 6,
  },
  store: MongoSessionStore.create({
    mongoUrl: process.env.MONGOURL,
    stringify: false,
    touchAfter: 6 * 3600,
  }),
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

app.all('*', authenticate);

app.use('/user', require('./routes/user'));
app.use('/config', require('./routes/config'));
app.use('/analysis', require('./routes/analysis'));
app.use('/matches', require('./routes/matches'));
app.use('/configs', require('./routes/configs'));

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
    log.fatal('Error launching web server', err);
    throw err;
  }
  log.info(`Web Server ready on http://localhost:${process.env.PORT}`);
});
