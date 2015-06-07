const bcrypt = require('bcryptjs');

module.exports = {
  checkAdmin(req, res, next) {
    const {auth, userId, admin} = req.session ? req.session : {};
    return auth && userId && admin ?
      console.info(`Access ADMIN: ${userId}`) && next() :
      next('User is not ad administrator');
  },
  checkApplicant(req, res, next) {
    const {auth, userId, approved, admin} = req.session ? req.session : {};
    return auth && userId && (approved || admin) ?
      next() :
      next('User is not logged in');
  },
  login(req, res, next) {
    console.log(`Logging in USER with email: ${req.body.email}`);
    req.db.User.findOne({email: req.body.email}, null, {safe: true}, (err, user) => {
      if (err) return next(err);
      if (user) {
        bcrypt.compare(req.body.password, user.password, (err, match) => {
          if (match) {
            req.session.auth = true;
            req.session.userId = user._id.toHexString();
            req.session.user = user;

            if (user.admin) {
              req.session.admin = true;
            }
            console.info(`Login User: ${req.session.userId}`);

            res.status(200).json({
              msg: 'Authorized'
            });
          } else {
            next(new Error('Wrong password'))
          }
        });
      } else {
        next(new Error('User is not found'));
      }
    });
  },
  logout(req, res) {
    console.info(`Logout USER: ${req.session.userId}`);
    req.session.destroy(error => !error && res.send({msg: 'Logged Out'}));
  },
  profile(req, res, next) {
    const fields = ['firstName', 'lastName', 'displayName', 'headline', 'photoUrl', 'admin', 'approved', 'banned',
      'role', 'angelUrl', 'twitterUrl', 'facebookUrl', 'linkedinUrl', 'githubUrl'].join(' ');

    req.db.User.findProfileById(req.session.userId, files, (err, obj) => {
      if (err) next(err);
      res.status(200).json(obj);
    });
  },
  delProfile(req, res, next) {
    console.log('del profile', req.session.userId);
    req.db.User.findByIdAndRemove(req.session.user._id, {}, (err, obj) => {
      if (err) next(err);
      req.session.destroy(error => !!err && next(err));
      res.status(200).json(obj);
    });
  }
};