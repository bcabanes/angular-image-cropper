var angular = require('angular');

var ngModule = angular.module('imageCropper', []);

var Cropper = require('./imageCropper');
require('./imageCropperDirective')(angular, Cropper);

module.exports = 'imageCropper';