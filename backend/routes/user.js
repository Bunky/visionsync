const router = require('express').Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const User = require('../models/user.model');
const defaultSettings = require('../processor/defaultSettings.json');
const { userLogger: logger } = require('../utils/logger');
const validation = require('../middleware/validation/validation');
const { auth } = require('../middleware/validation/schemas');
const { catchErrors } = require('../middleware/errorHandler');

// =================================================================================================
//                                               Login
// =================================================================================================

passport.use('login', new LocalStrategy({
  session: true,
  usernameField: 'email',
  passwordField: 'password',
}, (username, password, done) => {
  process.nextTick(async () => {
    try {
      const user = await User.findOne({ email: username });
      if (!user) {
        return done(null, false);
      }
      if (!user.verifyPassword(password, user.password)) {
        logger.log({
          level: 'info',
          message: 'User login incorrect password',
          metadata: {
            userEmail: user.email
          }
        });
        return done(null, false);
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  });
}));

// ==========================================Login Endpoint============================================

router.route('/login').post(validation(auth.login, 'body'), catchErrors(async (req, res, next) => {
  console.log('req.headers');
  console.log(req.headers);
  console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
  passport.authenticate('login', (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(200).send({ message: 'Incorrect email or password' });
    }

    req.logIn(user, async (loginError) => {
      if (loginError) {
        return next(loginError);
      }
      logger.log({
        level: 'info',
        message: 'User logged in',
        metadata: {
          userId: user._id.toString(),
          userEmail: user.email
        }
      });
      return res.sendStatus(200).send({ status: 'success' });
    });
  })(req, res, next);
}));

// =================================================================================================
//                                              Signup
// =================================================================================================

passport.use('signup', new LocalStrategy({
  passReqToCallback: true,
  usernameField: 'email',
  passwordField: 'password',
}, async (req, username, password, done) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user !== null) {
      logger.log({
        level: 'warn',
        message: 'User attempted creating account with taken name',
        metadata: {
          userEmail: req.body.email
        }
      });
      return done(null, false, { message: 'Email already taken' });
    }

    try {
      // Create new User
      const newUser = new User({
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(12)),
        termsOfService: req.body.termsOfService,
        settings: defaultSettings,
      });

      await newUser.save();
      logger.log({
        level: 'info',
        message: 'User created',
        metadata: {
          userId: newUser._id.toString(),
          userEmail: newUser.email
        }
      });
      return done(null, newUser);
    } catch (err) {
      return done(err);
    }
  } catch (err) {
    return done(err);
  }
}));

// ==========================================Signup Endpoint===========================================
router.route('/signup').post(validation(auth.signup, 'body'), catchErrors(async (req, res, next) => {
  passport.authenticate('signup', async (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(200).send({ message: info.message });
    }

    req.login(user, (loginError) => {
      if (loginError) {
        return next(err);
      }
      logger.log({
        level: 'info',
        message: 'User logged in after signing up',
        metadata: {
          userId: user._id.toString(),
          userEmail: user.email
        }
      });
      return res.sendStatus(200).send({ status: 'success' });
    });
  })(req, res, next);
}));

// =================================================================================================
//                                            Logout
// =================================================================================================

router.route('/logout').get(catchErrors(async (req, res) => {
  logger.log({
    level: 'info',
    message: 'User logged out',
    metadata: {
      userId: req.user._id.toString(),
      userEmail: req.user.email
    }
  });
  req.logout();
  return res.sendStatus(200);
}));

// =================================================================================================
//                                           Current User
// =================================================================================================

router.route('/').get(catchErrors(async (req, res) => {
  if (req.isAuthenticated()) {
    const user = await User.findById(req.user._id, {
      password: 0, __v: 0, settings: 0,
    });
    if (user) {
      return res.status(200).send(user);
    }
    return res.status(200).send({});
  }
  return res.status(200).send({});
}));

// =================================================================================================
//                                         Unique Email Check
// =================================================================================================

router.route('/email').post(validation(auth.email, 'body'), catchErrors(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(200).send({ unique: false });
  }
  return res.status(200).send({ unique: true });
}));

module.exports = router;
