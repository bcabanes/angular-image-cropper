(function (angular) {
  'use strict';
  angular
    .module('app')
    .controller('mainController', controller);
  controller.$inject = [
    '$scope'
  ];
  function controller($scope) {
    /* jshint validthis: true */
    var vm = this;
    //vm.imageUrl = 'test.jpg';
    //vm.imageUrl = 'http://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-324678.jpg';
    //vm.imageUrl = 'https://www.portablenorthpole.com/assets/wpdb/images/3/2015/10/banner-season1.84a9a3fa.jpg';
    vm.imageUrl = 'https://s3.amazonaws.com/pnp.photos/2015/prod/1446215228-56337e3c1a47f_pictureMain';
    vm.imageResult = '';
    vm.showControls = true;
    vm.fit = false;
  }
})(angular);
