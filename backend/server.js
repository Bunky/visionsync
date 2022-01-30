const express = require('express');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoSessionStore = require('connect-mongo');
require('dotenv').config();

// =================================================================================================
//                                       Web Server Configuration
// =================================================================================================

const server = express();
server.use(express.json());
server.use(express.urlencoded());

server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

server.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  secure: process.env.NODE_ENV !== 'development',
  proxy: process.env.NODE_ENV !== 'development',
  cookie: {
    maxAge: 60000 * 60 * 6
  },
  store: MongoSessionStore.create({
    mongoUrl: process.env.MONGOURL,
    stringify: false,
    touchAfter: 6 * 3600,
  }),
}));

// =================================================================================================
//                                       PassportJS Configuration
// =================================================================================================

server.use(passport.initialize());
server.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// =================================================================================================
//                                            API Routes
// =================================================================================================

server.use('/user', require('./routes/user'));

// =================================================================================================
//                                           MongoAtlas Config
// =================================================================================================

mongoose.connect(process.env.MONGOURL, {
  useNewUrlParser: true, useUnifiedTopology: true
});
const { connection } = mongoose;
connection.once('open', () => {
  console.log('MongoDB Atlas database connection established successfully');
});

// =================================================================================================
//                                           Web Server Init
// =================================================================================================

server.listen(process.env.PORT, (err) => {
  if (err) throw err;
  console.info(`> Ready on http://localhost:${process.env.PORT}`);
});
