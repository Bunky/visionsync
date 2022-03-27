const router = require('express').Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const User = require('../models/user.model');
const defaultSettings = require('../processor/defaultSettings.json');

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
        return done(null, false);
      }
      return done(null, user);
    } catch (e) {
      return done(e);
    }
  });
}));

// ==========================================Login Endpoint============================================
router.route('/login').post((req, res, next) => {
  const createSubscriptionSchema = Joi.object({
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .min(0)
      .max(64)
      .required(),
  });
  const { error } = createSubscriptionSchema.validate(req.body);

  if (error === undefined) {
    passport.authenticate('login', (err, user) => {
      if (err) {
        res.status(200).send({ authenticated: false, message: 'System error, please try again' });
        return next(err);
      }
      if (!user) {
        return res.status(200).send({ authenticated: false, message: 'Incorrect email or password' });
      }

      req.logIn(user, async (loginError) => {
        if (loginError) {
          res.status(200).send({ authenticated: false, message: 'System error, please try again' });
          return next(loginError);
        }
        console.log(`User ${user.email} logged in.`);
        return res.status(200).send({ authenticated: true, message: 'Successfully logged in' });
      });
    })(req, res, next);
  } else {
    return res.status(200).send({ authenticated: false, message: 'Invalid Submission' });
  }
});

// =================================================================================================
//                                              Signup
// =================================================================================================

passport.use('signup', new LocalStrategy({
  passReqToCallback: true,
  usernameField: 'email',
  passwordField: 'password'
}, async (req, username, password, done) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user !== null) {
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
        settings: defaultSettings
      });

      await newUser.save();
      console.log(`User ${req.body.email} created.`); // Report event
      return done(null, newUser);
    } catch (e) {
      return done(e);
    }
  } catch (e) {
    return done(e);
  }
}));

// ==========================================Signup Endpoint===========================================
router.route('/signup').post((req, res, next) => {
  // Validate data
  const createSubscriptionSchema = Joi.object({
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
  });
  const { error } = createSubscriptionSchema.validate(req.body);

  if (error === undefined) {
    passport.authenticate('signup', async (err, user, info) => {
      if (err) {
        res.status(200).send({ authenticated: false, message: 'System error, please try again' });
        return next(err);
      }
      if (!user) {
        return res.status(200).send({ authenticated: false, message: info.message });
      }

      req.login(user, (loginError) => {
        if (loginError) {
          return res.status(200).send({
            authenticated: false,
            message: 'Signed up successfully, but failed to automatically log in. Please try logging in.'
          });
        }
        console.log(`User ${user.email} logged in after signing up.`); // Report event
        return res.status(200).send({ authenticated: true, message: 'Signed up and logged in!' });
      });
    })(req, res, next);
  } else {
    return res.status(200).send({ authenticated: false, message: 'Invalid Submission' });
  }
});

// =================================================================================================
//                                            Logout
// =================================================================================================

router.route('/logout').get((req, res) => {
  if (req.isAuthenticated()) {
    console.log(`User ${req.user.email} logged out.`); // Report event
    req.logout();
    return res.sendStatus(200);
  }
  return res.sendStatus(400);
});

// =================================================================================================
//                                           Current User
// =================================================================================================

router.route('/').get(async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const user = await User.findById(req.user._id, {
        password: 0, __v: 0, settings: 0
      });
      if (user) {
        return res.status(200).send(user);
      }
      return res.status(200).send({ unauthorised: true });
    } catch (e) {
      return res.status(200).send({ unauthorised: true });
    }
  } else {
    return res.status(200).send({ unauthorised: true });
  }
});

// =================================================================================================
//                                         Unique Email Check
// =================================================================================================

router.route('/email').post(async (req, res) => {
  const emailSchema = Joi.object({
    email: Joi.string()
      .email()
      .required()
  });
  const { error } = emailSchema.validate(req.body);

  if (error === undefined) {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(200).send({ unique: false });
      }
      return res.status(200).send({ unique: true });
    } catch (e) {
      return res.status(200).send({ error: { message: 'Error validating email uniqueness!' } });
    }
  } else {
    return res.status(200).send({ unique: true });
  }
});

module.exports = router;
