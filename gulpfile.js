
const del = require('del');
const webpack = require('webpack-stream');
const gulp = require('gulp');
const html = require('gulp-file-include');
const sass = require('gulp-sass');
const styleLint = require('gulp-stylelint');
const sourcemaps  = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const svgSprite = require('gulp-svg-sprites');
const uglify = require('gulp-uglify');
const cssMin = require('gulp-cssmin');
const gulpif = require('gulp-if');

// paths config
const paths = new function() {
  this.root = 'www/';
  this.src = `${this.root}src/`;
  this.build = `${this.root}build/`;

  this.html = {
    src: `${this.root}templates/**/*.html`,
    entry: `${this.root}templates/pages/*.html`,
    dest: `${this.root}html`
  };

  this.images = {
    svg: `${this.root}images/svg/**/*.svg`,
    sprite: `${this.root}images/sprite`
  };

  this.styles = {
    src: `${this.src}scss/**/*.scss`,
    dest: `${this.build}css/`
  };

  this.scripts = {
    entry: `${this.src}js/main.js`,
    src: `${this.src}js/**/*.js`,
    dest: `${this.build}js/`
  };
}();

// server/reload config
// assignment occurs when required in the serve() task
let deployBuild = false;
let server = false;
let browserSync = undefined;
let reload = function() {
  return true;
};


// Clean build folder & HTML templates
// let clean = () => del([paths.build, paths.html.dest]);
function clean() {
  return del([paths.build, paths.html.dest]);
}


function serve() {
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
    .pipe(svgSprite({
      mode: 'symbols',
      preview: false,
      svgId: 'symbol-%f',
      svg: {
        symbols: 'symbols.svg'
      }
    }))
    .pipe(gulpif(server, reload()))
    .pipe(gulp.dest(paths.images.sprite));
}


// Compile CSS & Autoprefix/PostCSS
function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(styleLint({
      failAfterError: false,
      reporters: [
        { formatter: 'string', console: true }
      ]
    }))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulpif(deployBuild, cssMin()))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(gulpif(server, reload()));
};


// Compile JS with webpack
function scripts() {
  const webpackConfig = require('./webpack.config.js');
  webpackConfig.devtool = server ? 'source-map' : 'none';

  return gulp.src(paths.scripts.entry)
    .pipe(webpack({
      config: webpackConfig
    }))
    .on('error', function handleError() {
      this.emit('end'); // Recover from errors
    })
    .pipe(gulpif(deployBuild, uglify()))
    .pipe(gulpif(server, reload()))
    .pipe(gulp.dest(paths.scripts.dest));
}


// files for changes and run appropriate tasks accordingly
function watch(done) {
  gulp.watch(paths.html.src, templates);
  gulp.watch(paths.images.svg, sprite);
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.styles.src, styles);

  done();
}

function configureServer(done) {
  // we only need browsersync if running "develop" task
  browserSync = require ('browser-sync');
  reload = browserSync.stream;
  server = true;

  done();
}

function configureDeploy(done) {
  // set some deploy vars
  deployBuild = true;

  done();
}


// Standard dev build task
const build = gulp.series(clean, gulp.parallel(templates, sprite, styles, scripts));

// Production build task
const develop = gulp.series(configureServer, build, watch, serve);

// Production build task
const deploy = gulp.series(configureDeploy, build);


// export the tasks to be ran through npm
exports.build = build;
exports.develop = develop;
exports.deploy = deploy;


/*

Things TODO
-----------

  - Deployment Task
  - Revise ES6 linting rules (AirBnB currently)
  - Revise Sass linting rules (Numiko currently)
  - Webpack < 2% technique

*/