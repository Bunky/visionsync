const publicPaths = ['/user/login', '/user/signup', '/user/email', '/user', '/health', '/cookies-please'];

const authenticate = (req, res, next) => {
  if (publicPaths.indexOf(req.path) > -1) {
    return next();
  }

  if (req.isAuthenticated()) {
    return next();
  }
  return res.sendStatus(403);
};

module.exports = authenticate;
