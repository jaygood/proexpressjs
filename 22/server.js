const express = require('express');
const http = require('http');
const util = require('util');
const path = require('path');
const oauth = require('oauth');
const querystring = require('querystring');

const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const csrf = require('csurf');

const routes = require('./routes');
const models = require('./models');

const hs = require(path.join(__dirname, 'lib', 'hackhall-sendgrid'));
const c = require(path.join(__dirname, 'lib', 'env-vars'));
const GitHubStrategy = require('passport-github').Strategy;
const passport = require('passport');
const mongoose = require('mongoose');

app.set('port', process.env.PORT || 3000);

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  secret: process.env.SESSION_SECRET,
  key: 'sid',
  cookie: {
    secret: true,
    expires: false
  },
  resave: true,
  saveUninitialized: true
}));
app.use(express.static(`${__dirname}/public` ));

const logErrors = function(err, req, res, next) {
  const error = typeof err === 'string' ? new Error(err) : err;
  console.error('logErros', error.toString());
  next(error);
};

const clientErrorHandler = function(err, req, res, next) {
  if (req.xhr) {
    console.error('clientErrors response');
    res.status(500).json({error: err.toString()});
  } else {
    next(err);
  }
};

const errorHandler = function(err, req, res, next) {
  console.error('lastErrors resepponse');
  res.status(500).send(err.toString());
};

const dbUrl = process.env.MONGOHQ_URL || 'mongodb://@127.0.0.1:27017/hackhall';
const connection = mongoose.createConnection(dbUrl);
connection.on('error', console.eror.bind(console, 'connection error:'));

connection.once('open', () => console.info('connected to database'));

const db = function(req, res, next) {
  req.db = {
    User: connection.model('User', models.User, 'users'),
    Post: connection.model('Post', models.Post, 'posts')
  };
  return next();
};

const {auth, users, main: {checkUser, checkAdmin, checkApplicant}} = routes;

app.get('/auth/angellist', auth.angelList);
app.get('/auth/angellist/callback',
  auth.angelListCallback, auth.angelListLogin, db, users.findOrAddUser
);

app.get('/api/profile', checkUser, db, main.profile);
app.delete('/api/profile', checkUser, db, main.delProfile);
app.post('/api/login', db, main.login);
app.post('/api/logout', db, main.logout);




























