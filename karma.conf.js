var path = require('path');
var webpackConfig = require('./webpack.config');
var entry = path.resolve(webpackConfig.context, webpackConfig.entry);
var preprocessors = {};
preprocessors[entry] = ['webpack', 'coverage'];

webpackConfig.module.loaders.push({
  test: /\.js$/,
  exclude: /node_modules/,
  loader: 'istanbul-instrumenter-loader'
});

var isSingleRun = false;
if (process.env.SINGLE_RUN) {
  isSingleRun = true;
}

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai'],


    // list of files / patterns to load in the browser
    files: [entry],
    webpack: webpackConfig,


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: preprocessors,


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: isSingleRun,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'json', subdir: '.', file: 'coverage.json' },
        { type: 'lcov', subdir: 'report-lcov' },
        { type: 'html', subdir: 'html' },
        { type: 'text', subdir: '.' }
      ]
    },

    plugins: [
      require('karma-webpack'),
      'karma-chai',
      'karma-mocha',
      'karma-phantomjs-launcher',
      'karma-coverage'
    ]
  });
};
