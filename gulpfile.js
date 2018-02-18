const gulp = require('gulp');
const del = require('del');
const html = require('gulp-file-include');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const webpack = require('webpack-stream');


const paths = {
  root: 'www/',
  src: 'www/src/',
  build: 'www/build/',
  html: {
    src: 'www/templates/pages/*.html',
    dest: 'www/html/'
  },
  images: {
    svg: 'www/images/svg/**.*.svg',
    sprite: 'www/images/sprite/'
  },
  styles: {
    src: 'www/src/scss/**/*.scss',
    dest: 'www/build/css/'
  },
  scripts: {
    entry: 'www/src/js/main.js',
    src: 'www/src/js/**/*.js',
    dest: 'www/build/js/'
  }
};


// Clean build folder & HTML templates
let clean = () => del([paths.build, paths.html.dest]);


// HTTP server? maybe just webpack


// Build HTML templates
function templates() {
  return gulp.src(paths.html.src)
    .pipe(html())
    .pipe(gulp.dest(paths.html.dest));
}


// Build SVG symbol sprite
function sprite() {
  return gulp.src(paths.images.svg)
    .pipe(gulp.dest(paths.images.sprite));
}


// Compile CSS & Autoprefix/PostCSS
function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest(paths.styles.dest));
}


// Compile JS with webpack
function scripts() {
  return gulp.src(paths.scripts.entry)
    .pipe(webpack({
      output: {
        filename: 'bundle.js',
      }
    }))
    .pipe(gulp.dest(paths.scripts.dest));
}


// files for changes and run appropriate tasks accordingly
function watch() {
  gulp.watch(paths.html.src, templates);
  gulp.watch(paths.images.svg, sprite);
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.styles.src, styles);
}



// ES6 linting
// Sass linting




// Standard dev build task
let build = gulp.series(clean, gulp.parallel(templates, sprite, styles, scripts));

// Production build task
let develop = gulp.series(build, watch);

// Production build task
let deploy = gulp.series(build);

exports.build = build;
exports.develop = develop;
exports.deploy = deploy;