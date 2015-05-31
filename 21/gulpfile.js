var gulp = require('gulp');
var babel = require('gulp-babel');
var merge = require('merge-stream');

gulp.task('build', ['build-js', 'build-html']);

gulp.task('build-js', function () {
  var app = gulp.src('app.js')
    .pipe(babel())
    .pipe(gulp.dest('dist'));

  var routes = gulp.src('routes/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist/routes'));

  var tests = gulp.src('tests/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist/tests'));

  return merge(app, routes, tests);
});

gulp.task('build-html', function () {
  return gulp.src('./views/*.jade')
    .pipe(gulp.dest('./dist/views'));
});

gulp.task('build-css', function () {
  return gulp.src('./views/index.')
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('default', ['build'], function () {
  var app = require('./dist/app.js');
  app.listen(app.get('port'), function() {
    console.log('Up' + app.get('port'));
  });
});
