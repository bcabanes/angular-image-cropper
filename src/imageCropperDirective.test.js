module.exports = function(angular) {
  describe('Cropper directive', function() {
    this.timeout(5000);
    var $compile, $rootScope;

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

    it('should throw an error if no image url given', function() {
        var template = '<image-cropper></image-cropper>',
        $scope = $rootScope.$new();

      function compileTest() {
        var element = $compile(template)($scope);
      }

      expect(compileTest).to.throw(Error, /No image url/gi);
    });

    it('should be initialize itself with the element', function() {
      var imageUrl = 'https://images.unsplash.com/photo-1445404590072-16ef9c18bd83',
        template = '<image-cropper image-url="' + imageUrl + '"></image-cropper>',
        $scope = $rootScope.$new();

      var element = $compile(template)($scope);
      $scope.$digest();
      expect(element.html()).to.contain('imgCropper-image');
    });

    it('should do a basic crop with specs: w400 | h300 | f0 | r1 | z1', function(done) {
      var testReference = require('./imageTestReferences/w400-h300-z1-f1-r0'),
        imageUrl = 'data:image/jpeg;base64,' + testReference.original,
        $scope = $rootScope.$new();

      $scope.getCropperApi = function(api) {
        var image = api.crop();
        var test = image.replace(image.substr(0, image.indexOf(',') + 1), '');
        expect(test).to.equal(testReference.cropped);
        done();
      };

      var template = '<image-cropper image-url="' + imageUrl + '" api="getCropperApi" show-controls="false"></image-cropper>';
      var element = $compile(template)($scope);
      $scope.$digest();
    });

    it('should do a basic crop with specs: w400 | h300 | f1 | r270 | z3', function(done) {
      var testReference = require('./imageTestReferences/w400-h300-z3-f1-r270'),
        imageUrl = 'data:image/jpeg;base64,' + testReference.original,
        $scope = $rootScope.$new();

      $scope.getCropperApi = function(api) {
        api.zoomIn(3);
        api.rotate(270);
        api.fit();
        var image = api.crop();
        var test = image.replace(image.substr(0, image.indexOf(',') + 1), '');
        expect(test).to.equal(testReference.cropped);
        done();
      };

      var template = '<image-cropper image-url="' + imageUrl + '" api="getCropperApi" show-controls="false"></image-cropper>';
      var element = $compile(template)($scope);
      $scope.$digest();
    });

    it('should throw an error if degrees aren\'t %90', function(done) {
      var testReference = require('./imageTestReferences/w400-h300-z3-f1-r270'),
        imageUrl = 'data:image/jpeg;base64,' + testReference.original,
        $scope = $rootScope.$new();

      $scope.getCropperApi = function(api) {
        expect(function() {
          api.zoomIn(3);
          api.rotate(25);
        }).to.throw(Error, /Support only multiple of 90° for rotation./gi);
        done();
      };

      var template = '<image-cropper image-url="' + imageUrl + '" api="getCropperApi"></image-cropper>';
      var element = $compile(template)($scope);
      $scope.$digest();
    });

    //it('should give an error of tainted canvases with external image src', function(done) {
    //  var imageUrl = 'http://dummyimage.com/100x100',
    //    $scope = $rootScope.$new();
    //
    //  $scope.getCropperApi = function(api) {
    //    expect(api.crop).to.throw(Error);
    //    done();
    //  };
    //
    //  var template = '<image-cropper image-url="' + imageUrl + '" api="getCropperApi"></image-cropper>';
    //  var element = $compile(template)($scope);
    //  $scope.$digest();
    //});

    //it('should remove itself properly', function(done) {
    //  var testReference = require('./imageTestReferences/w400-h300-z3-f1-r270'),
    //    imageUrl = 'data:image/jpeg;base64,' + testReference.original,
    //    $scope = $rootScope.$new();
    //
    //  $scope.getCropperApi = function(api) {
    //    api.remove();
    //    $scope.$digest();
    //    expect(element.html()).to.be.empty;
    //    done();
    //  };
    //
    //  var template = '<image-cropper image-url="' + imageUrl + '" api="getCropperApi"></image-cropper>';
    //  var element = $compile(template)($scope);
    //  $scope.$digest();
    //});
  });
};