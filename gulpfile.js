const gulp = require('gulp');
const webpack = require('webpack-stream');

const del = require('del');
const html = require('gulp-file-include');
const sass = require('gulp-sass');


const paths = {
  root: 'www/',
  src: 'www/src/',
  build: 'www/build/',
  html: {
    src: 'www/templates/**/*.html',
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


// HTTP server? maybe just webpack

// Build HTML

// Build SVG sprites

// Clean build folder

// Compile CSS & autoprefix/PostCSS
function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sass())
    .dest(paths.styles.dest);
}

// Compile JS with webpack
function scripts() {
  return gulp.src(paths.scripts.entry)
    .pipe(webpack())
    .dest(paths.scripts.dest);
}



// ES6 linting
// CSS linting




// Standard dev build task

// Production build task