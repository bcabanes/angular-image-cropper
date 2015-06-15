(function() {
    'use strict';

    /**
     * Basics
     */
    var gulp = require('gulp');
    var config = require('../config.js');
    var $ = {};

    /**
     * Gulp plugins
     */
    $.autoprefixer = require('gulp-autoprefixer');
    $.minifyCss = require('gulp-minify-css');
    $.notify = require('gulp-notify');
    $.sass = require('gulp-sass');
    $.size = require('gulp-size');
    $.sourcemaps = require('gulp-sourcemaps');

    /**
     * Compile and Automatically Prefix Stylesheets
     */
     gulp.task('styles', function () {
         // For best performance, don't add Sass partials to `gulp.src`
         return gulp.src(config.paths.styles.main)
            .pipe($.sourcemaps.init())
            .pipe($.sass({
                'precision': 10,
                'onError': function(error) {
                    console.error(error, 'Sass error:');
                    return $.notify({
                        'title': 'SASS compilation ERROR',
                        'sound': 'Basso' // case sensitive
                    }).write(error);
                }

            }))
            .pipe($.autoprefixer({
                'browsers': config.browsers
            }))
            .pipe($.minifyCss())
            .pipe($.sourcemaps.write())
            .pipe(gulp.dest(config.paths.styles.dest))
            .pipe($.size({
                'title': 'styles'
            }));
    });
})();
