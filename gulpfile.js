'use strict';

const gulp = require('gulp');
const istanbul = require('gulp-istanbul');
const jshint = require('gulp-jshint');
const mocha = require('gulp-mocha');

gulp.task('lint', () => {
    return gulp.src([
            './lib/**/*.js',
            './example/**/*.js',
            './test/**/*.js'
        ])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('test', done => {
    gulp.src(['./lib/**/*.js'])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
        .on('finish', () => {
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

gulp.task('default', ['test']);