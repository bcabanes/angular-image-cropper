(function() {
    'use strict';

    /**
     * Include Gulp & Tools
     */
    var gulp = require('gulp');
    var requireDir = require('require-dir');
    var runSequence = require('run-sequence');
    var $ = {};

    /**
     * Plugins
     */
    $.taskListing = require('gulp-task-listing');

    /**
     * Get some configuration files
     */
    var config = require('./gulp/config.js');

    /**
     * Load all gulp taks
     */
    var tasks = requireDir('./gulp/tasks', { 'recurse': true });

    /**
     * Task: 'default'
     * List all available tasks
     */
    gulp.task('default', $.taskListing);

    /**
     * Task: 'help'
     * List all available tasks
     */
    gulp.task('help', $.taskListing);

    /**
     * Task: 'gulp build'
     */
    gulp.task('build', function(){
        runSequence(
            'styles',
            ['browser-sync']
        );
    });

    /**
     * Task: 'gulp dist'
     */
    gulp.task('dist', function() {
        runSequence(
            'styles',
            'jshint',
            'usemin'
        );
    });

})();
