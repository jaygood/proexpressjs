var gulp = require('gulp');
var babel = require('gulp-babel');

gulp.task('build', ['build-js', 'build-html']);

gulp.task('build-js', function () {
  return gulp.src('index.js')
    .pipe(babel())
    .pipe(gulp.dest('dist'));
});

gulp.task('build-html', function () {
  return gulp.src('./views/index.html')
    .pipe(gulp.dest('./dist/views'));
});

gulp.task('default', ['build'], function () {
  var app = require('./dist/index.js');
  app.listen(3001);
});
