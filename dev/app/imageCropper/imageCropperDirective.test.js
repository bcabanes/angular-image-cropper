module.exports = function(angular) {
  describe('Cropper directive', function() {
    var $compile, $rootScope;

    //var imageUrl = 'imageTestReferences/unsplash_7.jpg';
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
      var imageUrl = 'https://images.unsplash.com/photo-1445404590072-16ef9c18bd83',
        template = '<image-cropper image-url="' + imageUrl + '"></image-cropper>',
        $scope = $rootScope.$new();

      var element = $compile(template)($scope);
      $scope.$digest();
      expect(element.html()).to.contain('imgCropper-image');
    });

    it('should give an error of tainted canvases with external image src', function(done) {
      var imageUrl = 'https://images.unsplash.com/photo-1445404590072-16ef9c18bd83',
        $scope = $rootScope.$new();

      $scope.getCropperApi = function(api) {
        expect(api.crop).to.throw(Error, /tainted canvases/gi);
        done();
      };

      var template = '<image-cropper image-url="' + imageUrl + '" api="getCropperApi"></image-cropper>';
      var element = $compile(template)($scope);
      $scope.$digest();
    });

    //it('should do a basic crop with specs: w400 | h300 | s1 | r1 | z1', function(done) {
    //  var $scope = $rootScope.$new();
    //
    //  $scope.getCropperApi = function(api) {
    //    expect(api.crop).to.throw(Error, /tainted canvases/gi);
    //    done();
    //  };
    //
    //  var template = '<image-cropper image-url="' + imageUrl + '" api="getCropperApi"></image-cropper>';
    //  var element = $compile(template)($scope);
    //  $scope.$digest();
    //});
  });
};