(function() {

    /**
     * Basics
     */
    var gulp = require('gulp');
    var config = require('../config.js');
    var $ = {};
    var browserSync = require('browser-sync');

    /**
     * Gulp plugins
     */
    $.jshint = require('gulp-jshint');
    $.if = require('gulp-if');

    /**
     * Do not lint the constants.js and templates.js
     */
    var paths = [];
    paths.push(config.paths.scripts.src);
    paths.push('!dev/js/angular-image-cropper/templates.js');

    /**
     * Lint javascript
     */
    gulp.task('jshint', function() {
        return gulp.src(config.paths.scripts.src)
            .pipe(browserSync.reload({
                'stream': true,
                'once': true
            }))
            .pipe($.jshint())
            .pipe($.jshint.reporter(require('jshint-stylish'), {'verbose': true}))
            .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
    });
})();
