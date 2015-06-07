module.exports = {
  add(req, res, next) {
    req.db.User.create(Object.assign({angelList: {blah: 'bla'}}, req.body), (err, obj) => {
      if (err) return next(err);
      if (!obj) return next('cannot');
      res.status(200).json(obj);
    });
  },
  update(req, res, next) {
    const data = req.body;
    delete data._id;

    req.db.User.findByIdAndUpdate(req.session.user._id, {$set: data}, (err, obj) => {
      if (err) return next(err);
      if (!obj) return next('Cannot Save');
      res.status(200).json(obj);
    });
  },
  get(req, res, next) {
    const fields = ['firstName', 'lastName', 'photoUrl', 'headline', 'displayName', 'angelUrl', 'facebookUrl',
      'twitterUrl', 'linkedinUrl', 'githubUrl'].join(' ');
    req.db.User.findById(req.session.user._id, fields, {}, (err, obj) => {
      if (err) return next(err);
      if (!obj) return next('cannot find');
      res.status(200).json(obj);
    });
  }
};