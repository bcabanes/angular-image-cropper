if (ON_TEST) {
  require('./imageCropperDirective.test.js')(angular);
}

module.exports = function(angular, Cropper) {
  require('./angular-image-cropper.scss');
  angular
    .module('imageCropper')
    .directive('imageCropper', function() {
      var imageCropperController = function($scope) {
        var self = this;

        // Get action labels.
        this.actionLabels = this.actionLabels();

        // Get callback.
        this.apiCallback = this.api();
        this.cropCallback = this.cropCallback();

        // Eval for boolean values.
        this.fitOnInit = eval(this.fitOnInit);
        this.centerOnInit = eval(this.centerOnInit);
        this.checkCrossOrigin = eval(this.checkCrossOrigin);
        this.showControls = eval(this.showControls);

        this.init = function() {
          this.target = this.element;
          this.api = new Cropper(self);

          $scope.$watch('vm.imageUrl', function(newImageUrl, oldImageUrl) {
            if (angular.isDefined(newImageUrl)
              && !angular.equals(newImageUrl, oldImageUrl)
            ) {
              self.api.changeImage(newImageUrl);
            }
          });
        };
      };

      imageCropperController.$inject = ['$scope'];

      return {
        restrict: 'E',
        scope: {
          centerOnInit: '@',
          checkCrossOrigin: '@',
          cropCallback: '&',
          api: '&',
          fitOnInit: '@',
          height: '@',
          imageUrl: '@',
          showControls: '@',
          width: '@',
          zoomStep: '@',
          actionLabels: '&'
        },
        bindToController: true,
        controllerAs: 'vm',
        controller: imageCropperController,
        link: function(scope, element, attributes, controller) {
          controller.element = element[0];
          controller.init();
        }
      };
    });
};
