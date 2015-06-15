(function() {
    'use strict';

    /**
     * Basics
     */
    var gulp = require('gulp');
    var $ = {};

    /**
     * Gulp plugins
     */
    $.minifyCss = require('gulp-minify-css');
    $.minifyHtml = require('gulp-minify-html');
    $.usemin = require('gulp-usemin');
    $.uglify = require('gulp-uglify');

    /**
     * Concat, uglify files for prodctions
     */
    gulp.task('usemin', function() {
        gulp.src('dev/index.html')
            .pipe($.usemin({
                'css': [$.minifyCss(), 'concat'],
                'jsApp': [$.uglify()]
            }))
            .pipe(gulp.dest('dist/'));
    });

})();
