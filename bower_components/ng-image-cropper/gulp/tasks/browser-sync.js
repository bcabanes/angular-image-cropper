(function() {
    'use strict';

    /**
     * Basics
     */
    var gulp = require('gulp');
    var browserSync = require('browser-sync');
    var runSequence = require('run-sequence');
    var config = require('../config.js');
    var $ = {};

    /**
     * Plugins
     */
    $.watch = require('gulp-watch');

    /**
     * Build arrays for watchers
     */
    var stylesWatchers = config.paths.styles.src;
    var jsWatchers = config.paths.scripts.src;

    /**
      * Setup a local node server
      * Watch Files For Changes & Reload
      */
    gulp.task('browser-sync', function() {
        browserSync({
            notify: true, // Show notification in the browser
            server: {
                baseDir: './dev/'
            },
            port: 4000,
            ui: {
                port: 4001
            }
        });

        $.watch(stylesWatchers, function() {
            runSequence('styles', browserSync.reload);
        });
        $.watch(jsWatchers, function() {
            runSequence('jshint', browserSync.reload);
        });
    });

})();
