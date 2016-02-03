module.exports = function(angular) {
  describe('Cropper directive', function() {
    var $compile, $rootScope;
    var imageUrl = '../../../assets/images/unsplash_7.jpg';

    // Load the imageCropper module, which contains the directive.
    beforeEach(window.module('imageCropper'));

    /**
     * Store references to $rootScope and $compile,
     * so they are available to all tests in this describe block.
     */
    beforeEach(window.inject(function(_$compile_, _$rootScope_) {
      // The injector unwraps the underscore (_) from around the parameters name when matching.
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    }));

    it('should be initialize itself with the element', function() {
      var template = '<image-cropper image-url="' + imageUrl + '"></image-cropper>';
      var $scope = $rootScope.$new();

      var element = $compile(template)($scope);
      $scope.$digest();
      expect(element.html()).to.contain('imgCropper-image');
    });
};