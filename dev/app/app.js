var angular = require('angular');

if (ON_TEST) {
  require('angular-mocks/angular-mocks');
}

require('./app.css');

angular
  .module('app', [require('./../../src')])
  .controller('mainController', ['$scope', function($scope) {
    /* jshint validthis: true */
    var vm = this;

    // Some cropper options.
    vm.imageUrl = 'assets/images/unsplash_' + getRandomInt(1, 1) + '.jpg';
    vm.showControls = true;
    vm.fit = false;

    vm.myButtonLabels = {
      rotateLeft: ' (rotate left) ',
      rotateRight: ' (rotate right) ',
      zoomIn: ' (zoomIn) ',
      zoomOut: ' (zoomOut) ',
      fit: ' (fit) ',
      crop: ' [crop] '
    };

    vm.updateResultImage = function(base64) {
      vm.resultImage = base64;
      $scope.$apply(); // Apply the changes.
    };

    // Cropper API available when image is ready.
    //vm.cropperApi = function(cropperApi) {
    //  cropperApi.zoomOut(10);
    //  cropperApi.zoomIn(20);
    //  cropperApi.rotate(270);
    //  cropperApi.fit();
    //  vm.resultImage = cropperApi.crop();
    //  //cropperApi.remove();
    //  $scope.$apply(); // Apply the changes.
    //};

    /**
     * Returns a random integer between min (inclusive) and max (inclusive)
     */
    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }]);

