const express = require('express');
const routes = require('./routes');
const tasks = require('./routes/tasks');
const http = require('http');
const path = require('path');
const mongoskin = require('mongoskin');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const csrf = require('csurf');
const errorHandler = require('errorhandler');

const db = mongoskin.db('mongodb://localhost:27017/todo?auto_reconnect', {safe: true});
const app = express();

app.use((req, res, next) => {
  req.db = {
    tasks: db.collection('tasks')
  };
  next();
});

app.locals.appname = 'Express Stuff';
app.set('port', process.env.PORT || 3000);
app.set('views', `${__dirname}/views`);
app.set('view engine', 'jade');

app.use(favicon(path.join('dist', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());

app.use(cookieParser('cookie'));
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
app.use(csrf());
app.use(express.static(path.join(`${__dirname}/dist`)));
app.use((req, res, next) => {
  res.locals._csrf = req.csrfToken();
  return next();
});

app.param('task_id', (req, res, next, taskId) => {
  req.db.tasks.findById(taskId, (error, task) => {
    if (error) return next(error);
    if (!task) return next(new Error('No task'));
    req.task = task;
    return next();
  });
});

app.get('/', routes.index);
app.get('/tasks', tasks.list);
app.post('/tasks', tasks.markAllCompleted); // put
app.post('/tasks', tasks.add);
app.post('/tasks/:task_id', tasks.markCompleted);
app.delete('/tasks/:task_id', tasks.del);
app.get('/tasks/completed', tasks.completed);
app.all('*', (req, res) => res.status(404).send());

if(app.get('env') === 'developement') {
  app.use(errorHandler());
}

module.exports = app;
