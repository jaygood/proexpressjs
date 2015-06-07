const path = require('path');
const hs = require(path.join(__dirname, '..', 'lib', 'hackhall-sendgrid'));

const objectId = require('mongodb').ObjectID;

const fields = ['firstName', 'lastName', 'displayName', 'headline', 'photoUrl', 'admin', 'approved', 'banned',
  'role', 'angelUrl', 'twitterUrl', 'facebookUrl', 'linkedinUrl', 'githubUrl'].join(' ');

module.exports = {
  getUsers(req, res, next) {
    if (req.session.auth && req.session.userId) {
      req.db.User.find({}, safeFields, (err, list) => {
        if (err) return next(err);
        res.status(200).json(list);
      });
    } else {
      return next('User is not recognized');
    }
  },
  getUser(req, res, next) {
    let fields = safeFields;
    if (req.session.admin) {
      fields += ' email';
    }
    req.db.User.findProfileById(req.params.id, fields, (err, data) => {
      if (err) return next(err);
      res.status(200).json(data);
    })
  },
  add(req, res, next) {
    const user = new req.db.User(req.body);
    user.save(err => err ? next(err) : res.json(user));
  },
  update(req, res, next) {
    const obj = req.body;
    const approvedNow = obj.approved && obj.approvedNow;

    obj.updated = new Date();

    delete obj.approvedNow;
    delete obj._id;

    req.db.User.findByIdAndUpdate(req.params.id, {$set: obj}, {new: true}, (err, user) => {
      if (err) return next(err);
      if (approvedNow && user.approved) {
        console.log('approved');
        hs.notifyApproved(user, (error, user) => {
          if (error) return next(error);
          console.log('notification sent');
          res.status(200).json(user);
        });
      } else {
        res.status(200).json(user);
      }
    });
  },
  del(req, res, next) {
    req.db.User.findByIdAndRemove(req.params.id, (err, obj) => err ? next(err) : res.status(200).json(obj));
  },
  findOrAddUser(req, res, next) {
    const data = req.angelProfile;
    const angelListId = data.id;
    req.db.User.findOne({angelListId}, (err, obj) => {
      console.log('angelList Login findOrAddUser');
      if (err) return next(err);
      if (!obj) {
        console.warn('Creating a user', obj, data);
        const [firstName, lastName] = data.name.split(' ');
        req.db.User.create({
          angelListId,
          angelToken: req.session.angelListAccessToken,
          angelListProfile: data,
          email: data.email,
          firstName,
          lastName,
          displayName: data.name,
          headline: data.bio,
          photoUrl: data.image,
          angelUrl: data.angellist_url,
          twitterUrl: data.twitter_url,
          facebookUrl: data.facebook_url,
          linkedinUrl: data.linkedin_url,
          githubUrl: data.github_url
        }, (err, obj) => {
          if (err) return next(err);
          console.log('User was created', obj);
          Object.assign(req.session, {
            auth: true,
            userId: obj._id,
            user: obj,
            admin: false
          });
          res.redirect('/#application');
        });
      } else {
        Object.assign(req.session, {
          auth: true,
          userId: obj._id,
          user: obj,
          admin: obj.admin
        });
        if (obj.approved) {
          res.redirect('/#posts');
        } else {
          res.redirect('/#application')
        }
      }
    })
  }
};