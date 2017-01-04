const gulp = require('gulp');
const del = require('del');
const uglify = require('gulp-uglify');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const tsify = require('tsify');
const babel = require('gulp-babel');
const merge = require('merge2');

const tsProjectA = ts.createProject("tsconfig.json");
const tsProjectB = ts.createProject("tsconfig.json");

gulp.task("default", ["clean", "typescript", "browserify"]);

gulp.task("clean", function(cb) {
  del.sync(['./build/**/*']);
  cb();
})

gulp.task("cleandoc", function(cb) {
  del.sync(['./doc/**/*']);
  cb();
})

gulp.task("typescript", function() {
  let tsResultA = tsProjectA.src()
    .pipe(sourcemaps.init())
    .pipe(tsProjectA());
  
  let jsUnmin = tsResultA.js.pipe(babel())
    .pipe(gulp.dest("./build"))
    .pipe(sourcemaps.write("."));
  
  let tsResultB = tsProjectB.src()
    .pipe(sourcemaps.init())
    .pipe(tsProjectB());
  
  let jsMin = tsResultB.js.pipe(babel())
    .pipe(uglify())
    .pipe(sourcemaps.write("."));
  
  return merge([
    tsResultA.dts.pipe(gulp.dest("./build")),
    jsUnmin.pipe(gulp.dest("./build")),
    jsMin.pipe(gulp.dest("./build/min"))
  ]);
});

gulp.task("browserify", function() {
  return browserify({
      entries: ["./src/index.ts"],
      basedir: ".",
      debug: true,
      cache: {},
      packageCache: {},
      standalone: "jstween"
    })
    .plugin(tsify, require('./tsconfig.json').compilerOptions)
    .transform("babelify", {
      presets: ["env"],
      extensions: ['.ts', '.tsx']
    })
    .bundle()
    .on("error", function(error) {console.error(error.toString());})
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("./build/browser"))
});