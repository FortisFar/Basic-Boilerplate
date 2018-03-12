const gulp = require('gulp');
const html = require('gulp-file-include');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const gulpif = require('gulp-if');
const del = require('del');
const webpack = require('webpack-stream');

// paths config
const paths = new function() {
  this.root = 'www/';
  this.src = this.root + 'src/';
  this.build = this.root + 'build/';

  this.html = {
    src: this.root + 'templates/**/*.html',
    entry: this.root + 'templates/pages/*.html',
    dest: this.root + 'html/'
  }

  this.images = {
    svg: this.root + 'images/svg/**.*.svg',
    sprite: this.root + 'images/sprite/'
  }

  this.styles = {
    src: this.src + 'scss/**/*.scss',
    dest: this.build + 'css/'
  }

  this.scripts = {
    entry: this.src + 'js/main.js',
    src: this.src + 'js/**/*.js',
    dest: this.build + 'js/'
  }
}();

// server/reload config
// assignment occurs when required in the serve() task
let server = false;
const browserSync = undefined;
const reload = undefined;



// Clean build folder & HTML templates
// let clean = () => del([paths.build, paths.html.dest]);
function clean() {
  return del([paths.build, paths.html.dest]);
}


function serve() {
  // we only need browsersync if running "develop" task
  browserSync = require ('browser-sync');
  reload = browserSync.stream;
  server = true;

  browserSync.init({
      server: {
          baseDir: paths.root
      }
  });
}


// Build HTML templates
function templates() {
  return gulp.src(paths.html.entry)
    .pipe(html())
    .pipe(gulpif(server, reload()))
    .pipe(gulp.dest(paths.html.dest));
}


// Build SVG symbol sprite
function sprite() {
  return gulp.src(paths.images.svg)
    .pipe(gulpif(server, reload()))
    .pipe(gulp.dest(paths.images.sprite));
}


// Compile CSS & Autoprefix/PostCSS
function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulpif(server, reload()))
    .pipe(gulp.dest(paths.styles.dest));
}


// Compile JS with webpack
function scripts() {
  let devtool = server ? 'source-map' : 'none';
  
  return gulp.src(paths.scripts.entry)
    .pipe(webpack({
      watch: false,
      module: {
        rules: [
          {
            enforce: "pre",
            use: "eslint-loader",
          },
          {
            loader: 'babel-loader',
            query: {
              presets: [
                ["env", {
                  "targets": {
                    "browsers": ["last 2 versions", "safari >= 7"]
                  }
                }]
              ]
            }
          }
        ]
      },
      output: {
        filename: 'bundle.js',
      },
      devtool
    }))
    .on('error', function handleError() {
      this.emit('end'); // Recover from errors
    })
    .pipe(gulpif(server, reload()))
    .pipe(gulp.dest(paths.scripts.dest));
}


// files for changes and run appropriate tasks accordingly
function watch(cb) {
  gulp.watch(paths.html.src, function() {
    return templates();
  });

  gulp.watch(paths.images.svg, function() {
    return sprite();
  });

  gulp.watch(paths.scripts.src, function() {
    return scripts();
  });

  gulp.watch(paths.styles.src, function() {
    return styles();
  });

  cb();
}







// Standard dev build task
let build = gulp.series(clean, gulp.parallel(templates, sprite, styles, scripts));

// Production build task
let develop = gulp.series(build, watch, serve);

// Production build task
let deploy = gulp.series(build);

// export the tasks to be ran through npm
exports.build = build;
exports.develop = develop;
exports.deploy = deploy;


/*

Things TODO
-----------

  - ES6 linting rules (AirBnB currently)
  - Sass linting
  - Source Maps
  - SVG Sprites
  - Deployment Task

*/