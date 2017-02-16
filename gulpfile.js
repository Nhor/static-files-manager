var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var babel = require('gulp-babel');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var mocha = require('gulp-mocha');
var spawn = require('child_process').spawn;
var pjson = require('./package.json');
var nodeProcess;


/////////////
// BACKEND //
/////////////

gulp.task('copy-fixtures', function () {
  return gulp
    .src('./src/test/fixtures/*')
    .pipe(gulp.dest('./dist/test/fixtures'));
});

gulp.task('configure', function () {
  return gulp
    .src(['./src/Config.js.sample', './src/Config.js'])
    .pipe(replace(
      /Config\.name(.*)/,
      'Config.name = \'' + pjson.name + '\';'
    ))
    .pipe(replace(
      /Config\.version(.*)/,
      'Config.version = \'' + pjson.version + '\';'
    ))
    .pipe(gulp.dest('./src'));
});


//////////////
// FRONTEND //
//////////////

gulp.task('minify-html', function () {
  return gulp
    .src('./src/front/html/*.html')
    .pipe(htmlmin({collapseWhitespace: true, keepClosingSlash: true}))
    .pipe(gulp.dest('./dist/front/html'));
});


////////////
// COMMON //
////////////

gulp.task('compile-js', ['configure'], function () {
  return gulp
    .src('./src/**/*.js')
    .pipe(babel({presets: ['es2015']}))
    .pipe(uglify())
    .pipe(gulp.dest('./dist'));
});

gulp.task('build', ['copy-fixtures', 'minify-html', 'compile-js']);

gulp.task('watch', ['build'], function () {
  gulp.watch('./src/**/*', ['build']);
});

gulp.task('server', ['build'], function (callback) {
  nodeProcess = spawn('node', ['./dist/app.js'], {stdio: 'inherit'});
  setTimeout(callback, 1000);
});

gulp.task('kill', function (callback) {
  nodeProcess && nodeProcess.kill();
  setTimeout(callback, 1000);
});

gulp.task('test', ['server'], function () {
  return gulp
    .src('./dist/test/**/*.js')
    .pipe(mocha())
    .on('error', function () {
      return gulp.start('kill', function () {
        process.exit(1);
      });
    })
    .on('end', function () {
      return gulp.start('kill', function () {
        process.exit();
      });
    });
});


gulp.task('default', ['server']);
