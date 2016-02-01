(function (angular) {
  'use strict';
  angular
    .module('app')
    .controller('mainController', function() {
      /* jshint validthis: true */
      var vm = this;

      // Some cropper options.
      vm.imageUrl = 'charlotte.jpg';
      vm.showControls = false;
      vm.fit = false;

      // Cropper API available when image is ready.
      vm.cropperApi = function(cropperApi) {
        cropperApi.zoom(3);
        cropperApi.rotate(270);
        cropperApi.fit();
        cropperApi.crop();
      };
    });
})(angular);
