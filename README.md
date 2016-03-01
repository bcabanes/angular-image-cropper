[![travis](https://img.shields.io/travis/bcabanes/angular-image-cropper.svg?style=flat-square)](https://travis-ci.org/bcabanes/angular-image-cropper)
[![codecov](https://img.shields.io/codecov/c/github/bcabanes/angular-image-cropper.svg?style=flat-square)](https://codecov.io/github/bcabanes/angular-image-cropper)
[![version](https://img.shields.io/npm/v/angular-image-cropper.svg?style=flat-square)](https://www.npmjs.com/package/angular-image-cropper)
[![downloads](https://img.shields.io/npm/dm/angular-image-cropper.svg?style=flat-square)](https://www.npmjs.com/package/angular-image-cropper)
[![MIT License](https://img.shields.io/npm/l/simpsons-names.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](http://commitizen.github.io/cz-cli/)

# Angular image cropper

## Live example

To see a live example, go to the [demo's page](http://bcabanes.github.io/angular-image-cropper/).

## Description

Angular image cropper is inspired of the popular Guillotine jQuery plugin
that allows to **drag**, **zoom** or **rotate** an image to select a cropping area.
Like selecting the display area of a profile picture or avatar.

* **Responsive:** The window (or selection area) is fully responsive (fluid)
* **Touch support:** Dragging the image also works on touch devices
* **API:** Provide an API to do more action with code 
* **No needs of jQuery:** Written in pure javascript

## Installation

#### Using [NPM](https://www.npmjs.com/package/angular-image-cropper)

```bash
npm install angular-image-cropper
```

#### Using [Bower](http://bower.io/) (not recommended)

```bash
bower install https://npmcdn.com/angular-image-cropper/bower.zip
```

Or if you want to install a specific version (e.g: for 1.1.4):
```bash
bower install https://npmcdn.com/angular-image-cropper@1.1.4/bower.zip --save
```

## Usage

### Load the required files

#### Using modules

Just require the module when you declare your module's dependencies:
```javascript
var angular = require('angular');
angular
  .module('myApp', [require('angular-image-cropper')])
  .controller(/*...*/);
```

#### Using script tags

Just import the `angular-image-cropper` javascript file in your `index.html`:
```html
<script src="/path/to/angular-image-cropper.js"></script>
```

Add the module as dependency to your main application module like this:
```javascript
angular.module('myApp', ['imageCropper']);
```

### The directive

```html
<image-cropper image-url="myImageUrlOrBase64"
  width="640"
  height="480"
  show-controls="true"
  fit-on-init="false"
  center-on-init="true"
  api="getApiFunction"
  crop-callback="myCallbackFunction"
  check-cross-origin="false"
  zoom-step="0.1"
  action-labels="myButtonLabelsObject"
></image-cropper>
```

#### Options

Angular image cropper comes with some options to simplify your development:
* `image-url` _string_ Source image that will be cropped, can be an URL or base64
* `width` _string_ Width of the cropped image
* `height` _string_ Height of the cropped image
* `zoom-step` _string_ Zoom step
* `fit-on-init` _boolean_ Fit the image on cropper initialization (keep the ratio)
* `center-on-init` _boolean_ Center the image on cropper initialization
* `show-controls` _boolean_ Display or not the control buttons (`true` by default)
* `check-cross-origin` _boolean_ Enable cross origin or not
* `crop-callback` _function_ Function executed with base64 cropped image as argument when when crop control is clicked
```javascript
vm.updateResultImage = function(base64) {
  vm.resultImage = base64;
  $scope.$apply(); // Apply the changes.
};
```
* `api` _function_ Function executed with cropper's API as argument
* `action-labels` _object_ Give you the ability to customize button labels by passing an object like
```javascript
vm.myButtonLabels = {
  rotateLeft: ' (rotate left) ',
  rotateRight: ' (rotate right) ',
  zoomIn: ' (zoomIn) ',
  zoomOut: ' (zoomOut) ',
  fit: ' (fit) ',
  crop: ' <span class="fa fa-crop">[crop]</span> ' // You can pass html too.
}
```

#### Api

Angular image cropper gives you access to the api, you can see an example [here](https://github.com/bcabanes/angular-image-cropper/blob/master/dev/app/app.js):
```javascript
// Cropper API available when image is ready.
vm.getCropperApi = function(api) {
  api.zoomIn(3);
  api.zoomOut(2);
  api.rotate(270);
  api.fit();
  vm.resultImage = api.crop();
};
```
* `crop` _function_ return the cropped image in `base64`
* `fit` _function_ fit the image to the wrapper dimensions (keep the ratio)
* `rotate` _function_ Apply the rotation with degrees given, should be a modulo of 90 (90, 180, 270, 360), can be negative 
* `zoomIn` _function_ Apply the zoomIn given
* `zoomOut` _function_ Apply the zoomOut given
* `remove` _function_ Remove the cropper

## License

The MIT License (MIT)
