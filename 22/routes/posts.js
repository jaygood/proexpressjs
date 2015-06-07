const LIMIT = 10;
const SKIP = 0;


const actOn = {
  like(req, res, next) {
    req.db.Post.findByIdAndUpdate(req.body._id, {
      $push: {likes: req.session.userId}
    }, {}, (err, obj) => err ? next(err) : res.status(200).json(obj));
  },
  watch(req, res, next) {
    req.db.Post.findByIdAndUpdate(req.body._id, {
      $push: {watches: req.session.userId}
    }, {}, (err, obj) => err ? next(err) : res.status(200).json(obj));
  },
  comment(req, res, next) {
    req.db.Post.findByIdAndUpdate(req.params.id, {
      $push: {
        comments: {
          author: {
            id: req.session.userId,
            name: req.session.user.displayName
          },
          text: req.body.comment
        }
      }
    }, {safe: true, new: true},
      (err, obj) => (err, obj) => err ? next(err) : res.status(200).json(obj)
    );
  }
};

module.exports = {
  add(req, res, next) {
    if (req.body) {
      req.db.Post.create({
        title: req.body.title,
        text: req.body.text || null,
        url: req.body.url || null,
        author: {
          id: req.session.user._id,
          name: req.session.user.displayName
        }
      }, (err, docs) => {
        err ? console.error(err) || next(err) : res.status(200).json(docs);
      });
    } else {
      next(new Error('no data'));
    }
  },
  getPosts(req, res, next) {
    const limit = req.query.limit || LIMIT;
    const skip = req.query.skip || SKIP;

    req.db.Post.find({}, null, {
      limit, skip,
      sort: {
        _id: -1
      }
    }, (err, obj) => {
      if (!obj) return next('nothing');
      const {user: {admin, _id}, userId} = req.session;
      const posts = docs.map((doc) => {
        return Object.assign(doc.toObject(), {
          admin: !!admin,
          own: doc.author.id === userId,
          like: doc.likes && doc.likes.includes(_id),
          watch: doc.watches && doc.watches.includes(_id)
        });
      });
      req.db.Post.count({}, (err, total) => err ? next(err) : res.status(200).json({limit, skip, posts, total}));
    });
  },
  getPost(req, res, next) {
    if (req.params.id) {
      req.db.Post.findById(req.params.id, {
        title: true, text: true, url: true, author: true, comments: true, watches: true, likes: true
      }, (err, obj) => {
        if (err) return next(err);
        if (!obj) {
          next('Nothing');
        } else {
          res.status(200).json(obj);
        }
      });
    } else {
      next('No post id');
    }
  },
  del(req, res, next) {
    req.db.Post.findById(req.params.id, (err, obj) => {
      if (err) return next(err);
      if (req.session.admin || req.session.userId === obj.author.id) {
        obj.remove();
        res.status(200).json(obj);
      } else {
        next('User is not authorized');
      }
    });
  },
  updatePost(req, res, next) {
    let anyAction = false;
    if (req.body._id && req.params.id) {
      const action = req.body.action;
      if (action === 'like' || action === 'watch' || action === 'comment') {
        anyAction = true;
        actOn[action](req, res, next);
      } else if (req.session.auth && req.session.userId || req.session.user.admin) {
        req.db.Post.findById(req.params.id, (err, doc) => {
          if (err) next(err);
          doc.title = req.body.title;
          doc.text = req.body.text || null;
          doc.url = req.body.url || null;
          doc.save((e, d) => e ? next(e) : res.status(200).json(d));
        });
      } else {
        if (!anyaction) next('somethin wrong')
      }
    } else {
      next('no post id')
    }
  }
};