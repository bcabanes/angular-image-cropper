(function(angular) {
  'use strict';

  angular
    .module('imageCropper')
    .directive('imageCropper', directive);

  directive.$inject = [
    'Cropper',
    'defaultConfig',
    'Helper'
  ];

  function directive(mCropper, defaultConfig, Helper) {
    return {
      'restrict': 'E',
      'scope': {
        'image': '@',
        'destWidth': '@',
        'destHeight': '@',
        'zoomStep': '@',
        'init': '@',
        'croppedImage': '=',
        'showControls': '=',
        'fitOnInit': '='
      },
      /*'template': ['<div class="frame">',
        '<div class="imgCropper-window">',
        '<div class="imgCropper-canvas">',
        '<img ng-src="{{image}}">',
        '</div></div></div>',
        '<div id="controls" ng-if="showControls">',
        '<button ng-click="rotateLeft()" type="button" title="Rotate left"> &lt; </button>',
        '<button ng-click="zoomOut()" type="button" title="Zoom out"> - </button>',
        '<button ng-click="fit()" type="button" title="Fit image"> [ ] </button>',
        '<button ng-click="zoomIn()" type="button" title="Zoom in"> + </button>',
        '<button ng-click="rotateRight()" type="button" title="Rotate right"> &gt; </button>',
        '</div>'].join(''),*/
      'link': link
    };

    function link(scope, element, attributes) {
      new Cropper({
        imageURL: scope.image,
        target: element[0],
        checkCrossOrigin: true
      });
    }
  }
})(angular);


function Cropper(options) {
  var _elements;
  this.elements = _elements = {};
  this.originalURL = options.imageURL;

  this.options = {};
  this.options.checkCrossOrigin = options.checkCrossOrigin || false;

  _elements.target = options.target;
  _elements.body = document.getElementsByTagName('body')[0];

  this.buildDOM();

  console.log(this.elements);
}

/**
 * Build DOM element for the Cropper appended in the targeted element.
 */
Cropper.prototype.buildDOM = function() {
  var _elements;
  _elements = this.elements;

  // Wrapper.
  _elements.wrapper = document.createElement('div');
  _elements.wrapper.className = 'imgCropper-wrapper';

  // Canvas.
  _elements.container = document.createElement('div');
  _elements.container.className = 'imgCropper-container';

  // Image.
  _elements.image = document.createElement('img');
  _elements.image.className = 'imgCropper-image';


  // Target -> Wrapper -> Container -> Image
  _elements.container.appendChild(_elements.image);
  _elements.wrapper.appendChild(_elements.container);
  _elements.target.appendChild(_elements.wrapper);

  // Controls.
  _elements.controls = {};
  _elements.controls.wrapper = document.createElement('div');
  _elements.controls.wrapper.className = 'imgCropper-controls';

  _elements.controls.rotateLeft = document.createElement('button');
  _elements.controls.rotateLeft.innerHTML = ' &lt; ';
  _elements.controls.rotateRight = document.createElement('button');
  _elements.controls.rotateRight.innerHTML = ' &gt; ';
  _elements.controls.zoomIn = document.createElement('button');
  _elements.controls.zoomIn.innerHTML = ' + ';
  _elements.controls.zoomOut = document.createElement('button');
  _elements.controls.zoomOut.innerHTML = ' - ';
  _elements.controls.fit = document.createElement('button');
  _elements.controls.fit.innerHTML = ' [ ] ';

  // Target -> Wrapper -> buttons
  _elements.controls.wrapper.appendChild(_elements.controls.rotateLeft);
  _elements.controls.wrapper.appendChild(_elements.controls.rotateRight);
  _elements.controls.wrapper.appendChild(_elements.controls.zoomIn);
  _elements.controls.wrapper.appendChild(_elements.controls.zoomOut);
  _elements.controls.wrapper.appendChild(_elements.controls.fit);
  _elements.target.appendChild(_elements.controls.wrapper);

  this.loadImage();
};

Cropper.prototype.loadImage = function() {
  var self = this;
  var xhr;

  // XMLHttpRequest disallows to open a Data URL in some browsers like IE11 and Safari.
  if (/^data\:/.test(this.originalURL)) {
    this.originalBase64 = this.originalURL;
    this.setupImageSRC();
  }

  xhr = new XMLHttpRequest();
  xhr.onerror = xhr.onabort = function(response) {
    // TODO: Try to continue.
    self.originalBase64 = self.originalURL;
    self.setupImageSRC();
  };

  // Need to have proper sets of 'Access-Control-Allow-Origin' on the requested resource server.
  xhr.onload = function() {
    self.originalArrayBuffer = this.response;
    self.originalBase64 = 'data:image/jpeg;base64,' + self.base64ArrayBuffer(this.response);
    self.setupImageSRC();
  };
  xhr.open('get', this.originalURL, true);
  //xhr.setRequestHeader('Content-Type', 'image/jpg'); // TODO: Auto determine the image MIME's type.
  xhr.responseType = 'arraybuffer';
  xhr.send();
};

/**
 * Check crossOrigins and setup image src.
 * TODO: Send event when image is loaded.
 */
Cropper.prototype.setupImageSRC = function() {
  var _image = this.elements.image;
  var crossOrigin, crossOriginUrl;

  if (this.options.checkCrossOrigin && this.isCrossOrigin(this.originalURL)) {
    this.crossOrigin = _image.crossOrigin;

    if (this.crossOrigin) {
      this.crossOrigin = this.originalURL;
    } else {
      this.crossOrigin = 'anonymous';

      // Bust cache with a timestamp.
      this.crossOriginUrl = this.addTimestamp(this.originalURL);
    }
  }

  if (this.crossOrigin) {
    this.elements.image.crossOrigin = this.crossOrigin;
  }

  // Setup image src.
  this.elements.image.src = this.crossOriginUrl || this.originalURL; // Need to verify.
  //this.elements.image.src = this.originalBase64; // Need to verify.
};

/**
 * Helper for adding a timestamp at the end of an URL.
 * @param url
 * @returns {Buffer|Array.<T>|string}
 */
Cropper.prototype.addTimestamp = function(url) {
  var timestamp = 'timestamp=' + (new Date()).getTime();
  var sign = '?';

  if (url.indexOf('?') !== -1) {
    sign = '&';
  }

  return url.concat(sign, timestamp);
};

/**
 * Helper for checking if the given url is cross origin.
 * @param url
 * @returns {Array|{index: number, input: string}|*|{bool, needsContext}|boolean}
 */
Cropper.prototype.isCrossOrigin = function(url) {
  var parts = url.match();

  return parts && (
      parts[1] !== location.protocol ||
      parts[2] !== location.hostname ||
      parts[3] !== location.port
    );
};

/**
 * Helper for converting arrayBuffer to base64.
 * @param arrayBuffer
 * @returns {string}
 */
Cropper.prototype.base64ArrayBuffer = function(arrayBuffer) {
  var base64 = '';
  var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  var bytes = new Uint8Array(arrayBuffer);
  var byteLength = bytes.byteLength;
  var byteRemainder = byteLength % 3;
  var mainLength = byteLength - byteRemainder;
  var a, b, c, d;
  var chunk;
  // Main loop deals with bytes in chunks of 3
  for (var i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
    d = chunk & 63;               // 63       = 2^6 - 1
    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
  }
  // Deal with the remaining bytes and padding
  if (byteRemainder == 1) {
    chunk = bytes[mainLength];
    a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2
    // Set the 4 least significant bits to zero
    b = (chunk & 3) << 4; // 3   = 2^2 - 1
    base64 += encodings[a] + encodings[b] + '==';
  } else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
    a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4
    // Set the 2 least significant bits to zero
    c = (chunk & 15) << 2; // 15    = 2^4 - 1
    base64 += encodings[a] + encodings[b] + encodings[c] + '=';
  }
  return base64;
};













































