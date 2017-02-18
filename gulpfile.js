var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var sass = require('gulp-sass');
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

gulp.task('copy-front-dependencies', function () {
  return gulp
    .src([
      './node_modules/react/dist/react.min.js',
      './node_modules/react-dom/dist/react-dom.min.js',
      './node_modules/react-router/umd/ReactRouter.min.js',
      './node_modules/react-scrollbar/dist/scrollArea.js',
      './node_modules/lodash/lodash.min.js'
    ])
    .pipe(gulp.dest('./dist/front/dependencies'));
});

gulp.task('minify-and-copy-front-dependencies', function () {
  return gulp
    .src([
      './node_modules/superagent/superagent.js',
      './node_modules/requirejs/require.js'
    ])
    .pipe(uglify())
    .pipe(gulp.dest('./dist/front/dependencies'));
});

gulp.task('copy-front-static', function () {
  return gulp
    .src('./src/front/static/**/*')
    .pipe(gulp.dest('./dist/front/static'));
});

gulp.task('minify-html', function () {
  return gulp
    .src('./src/front/html/*.html')
    .pipe(htmlmin({collapseWhitespace: true, keepClosingSlash: true}))
    .pipe(gulp.dest('./dist/front/html'));
});

gulp.task('compile-sass', function () {
  return gulp
    .src('./src/front/sass/style.scss')
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(gulp.dest('./dist/front/css'));
});

gulp.task('compile-jsx', ['configure'], function () {
  return gulp
    .src('./src/front/js/**/*.jsx')
    .pipe(babel({presets: ['react', 'es2015']}))
    .pipe(uglify({mangle: {except: ['require']}}))
    .pipe(gulp.dest('./dist/front/js'));
});

////////////
// COMMON //
////////////

gulp.task('compile-js', ['configure'], function () {
  return gulp
    .src('./src/**/*.js')
    .pipe(babel({presets: ['es2015']}))
    .pipe(uglify({mangle: {except: ['require']}}))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build', [
  'copy-fixtures',
  'copy-front-dependencies',
  'minify-and-copy-front-dependencies',
  'copy-front-static',
  'minify-html',
  'compile-sass',
  'compile-jsx',
  'compile-js'
]);

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
