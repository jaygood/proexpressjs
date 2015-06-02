module.exports = {
  list({db: {tasks}}, res, next) {
    tasks.find({
      completed: false
    }).toArray((error, tasks = []) => {
      if (error) return next(error);
      res.render('tasks', {
        tasks,
        title: 'Todo List'
      });
    });
  },

  add({body, db}, res, next) {
    if (!body || !body.name) return next(new Error('No data'));
    db.tasks.save({
      name: body.name,
      completed: false
    }, (error, task) => {
      if (error) return next(error);
      if (!task) return next(new Error('failed to save'));
      console.info(`Added ${task.name} with id=${task._id}`);
      res.redirect('/tasks');
    });
  },

  markAllCompleted(req, res, next) {
    if (!req.body.all_done || req.body.all_done !== 'true') return next();
    req.db.tasks.update({completed: false}, {$set: {completed: true}}, {multi: true}, (error, count) => {
      if (error) return next(error);
      console.info(`Marked ${count} tasks completed.`);
      res.redirect('/tasks')
    });
  },

  completed(req, res, next) {
    req.db.tasks.find({
      completed: true
    }).toArray((error, tasks = []) => {
      res.render('tasks_completed', {
        tasks,
        title: 'Completed'
      });
    });
  },

  markCompleted(req, res, next) {
    if (!req.body.completed) return next(new Error('missing param'));
    req.db.tasks.updateById(req.task_id, {$set: {completed: req.body.completed === 'true'}}, (error, count) => {
      if (error) return next(error);
      if (count !== 1) return next(new Error('Something wrong'));
      console.info(`Marked task ${req.task.name} with ${req.task._id}`);
      res.redirect('/tasks');
    })
  },

  del(req, res, next) {
    req.db.tasks.removeById(req.task._id, (error, count) => {
      if (error) return next(error);
      if (count !== 1) return next(new Error());
      console.info(`deleted ${req.tasks.name}`);
      res.status(204).send();
    })
  }
};