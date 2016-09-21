'use strict';

var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');

gulp.task('lint', function () {
    return gulp.src([
            './index.js',
            './example/**/*.js',
            './lib/**/*.js',
            './test/**/*.js'
        ])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('unit-test', function (done) {
    gulp.src(['./lib/**/*.js'])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
        .on('finish', function () {
            gulp.src(['./test/**/*.test.js'])
                .pipe(mocha({
                    reporter: 'spec'
                }))
                .pipe(istanbul.writeReports({
                    dir: './docs/coverage'
                }))
                .on('end', done);
        });
});

gulp.task('test', ['lint', 'unit-test']);

gulp.task('default', ['test']);