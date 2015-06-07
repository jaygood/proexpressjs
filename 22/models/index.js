const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const roles = ['user', 'staff', 'mentor', 'investor', 'founder'];
const USER = 'User';

const Post = new Schema({
  title: {
    required: true,
    type: String,
    trim: true,
    match: /^([\w ,\.!?]{1,100})$/
  },
  url: {
    type: String,
    trim: true,
    max: 1000
  },
  text: {
    type: String,
    trim: true,
    max: 2000
  },
  comments: [{
    text: {
      type: String,
      trim: true,
      max: 2000
    },
    author: {
      id: {
        type: Schema.Types.ObjectId,
        ref: USER
      },
      name: String
    }
  }],
  watches: [{
    type: Schema.Types.ObjectId,
    ref: USER
  }],
  likes: [{
    type: Schema.Types.ObjectId,
    ref: USER
  }],
  author: {
    id: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  created: {
    type: Date,
    default: Date.now,
    required: true
  },
  updated: {
    type: Date,
    default: Date.now,
    required: true
  }
});

Post.pre('save', next => {
  if (!this.isModified('updated')) this.updated = new Date;
  next();
});


const User = new Schema({
  angelListId: String,
  angelListProfile: Schema.Types.Mixed,
  angelToken: String,
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  password: String,
  email: {
    type: String,
    require: true,
    trim: true
  },
  roles: {
    type: String,
    enum: roles,
    required: true,
    default: roles[0]
  },
  approved: {
    type: Boolean,
    default: false
  },
  banned: {
    type: Boolean,
    default: false
  },
  admin: {
    type: Boolean,
    default: false
  },
  headline: String,
  photoUrl: String,
  angelList: Schema.Types.Mixed,
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  },
  angelUrl: String,
  twitterUrl: String,
  facebookUrl: String,
  linkedinUrl: String,
  githubUrl: String,
  posts: {
    own: [Schema.Types.Mixed],
    likes: [Schema.Types.Mixed],
    watches: [Schema.Types.Mixed],
    comments: [Schema.Types.Mixed]
  }
});


User.plugin(findOrCreate);

User.statics.findProfileById = function(id, fields, cb) {
  const Post = this.model('Post');
  return this.findById(id, fields, (err, obj) => {
    if (err) return cb(err);
    if (!obj) return cb(new Error('User is not found'));
    Post.find({author: {id: obj._id, name: obj.displayName}}, null, {sort: {created: -1}}, (err, list) => {
      if (err) return cb(err);
      obj.posts.own = list || [];
      Post.find({likes: obj._id}, null, {sort: {created: -1}}, (err, list) => {
        if (err) return cb(err);
        obj.posts.likes = list || [];
        Post.find({watches: obj._id}, null, {sort: {created: -1}}, (err, list) => {
          if (err) return cb(err);
          obj.posts.watches = list || [];
          Post.find({'comments.author.id': obj._id}, null, {sort: {created: -1}}, (err, list) => {
            if (err) return cb(err);
            obj.posts.comments = [];
            list.forEach(post =>
              obj.posts.comments = obj.posts.comments.concat(post.comments.filter(
                comment => comment.author.id.toString() === obj._id.toString())
              )
            );
            cb(null, obj);
          });
        });
      });
    });
  });
};

module.exports = {
  Post,
  User
};