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
  this.isReady = false;
  this.originalURL = options.imageURL;

  // Setup options.
  this.options = {
    checkCrossOrigin: options.checkCrossOrigin || false,
    width: options.destWidth || 400,
    height: options.destHeight || 300,
    showControls: options.showControls || true,
    fitOnInit: options.fitOnInit || false,
    zoomStep: options.zoomStep || 0.1
  };

  // Setup gesture events.
  this.gesture = {};
  this.gesture.events = {
    start: 'touchstart mousedown',
    move: 'touchmove mousemove',
    stop: 'touchend mouseup'
  };

  this.pointerPosition = undefined;

  // Setup basic elements.
  this.elements = {
    target: options.target,
    body: document.getElementsByTagName('body')[0]
  };

  this.buildDOM();
  this.useHardwareAccelerate(this.elements.image);

  /**
   * TODO: Create a function to regroup these things.
   */
  //this.events.on('ImageReady', function() {
  //  self.zoomImage(3.5);
  //  self.rotateImage(180);
  //});
  this.events.on('ImageReady', this.initialize.bind(this));

console.log(this);
}

Cropper.prototype.initialize = function() {
  this.setDimensions();

  if (this.width < 1 || this.height < 1) { // 1 means 100%.
    this.fitImage();
    this.centerImage();
  }
  this.initializeGesture();

  //if (this.imageHasToFit()) {
  //  this.fitImage();
  //}

  this.centerImage();

  if (this.options.showControls) {
    this.bindControls();
  }
};

Cropper.prototype.bindControls = function() {
  var self = this;
  this.elements.controls.rotateLeft.addEventListener('click', function() {
    self.applyRotation(-90);
  });
  this.elements.controls.rotateRight.addEventListener('click', function() {
    self.applyRotation(90);
  });
  this.elements.controls.zoomIn.addEventListener('click', function() {
    self.applyZoom(self.zoomInFactor);
  });
  this.elements.controls.zoomOut.addEventListener('click', function() {
    self.applyZoom(self.zoomOutFactor);
  });
  this.elements.controls.fit.addEventListener('click', this.applyFit.bind(this));
  this.elements.controls.crop.addEventListener('click', this.cropImage.bind(this));
};

Cropper.prototype.applyRotation = function(degree) {
  this.rotateImage(degree);
};

Cropper.prototype.applyZoom = function(zoom) {
  this.zoomImage(zoom);
};

Cropper.prototype.applyFit = function() {
  this.fitImage();
  this.centerImage();
};

Cropper.prototype.imageHasToFit = function() {
  return this.elements.image.naturalWidth < this.options.width ||
    this.elements.image.naturalHeight < this.options.height ||
    this.options.fitOnInit;
};

/**
 * Build DOM element for the Cropper appended in the targeted element.
 */
Cropper.prototype.buildDOM = function() {
  var _elements;
  _elements = this.elements;

  // Wrapper.
  _elements.wrapper = document.createElement('div');
  _elements.wrapper.className = 'imgCropper-wrapper';

  // Container.
  _elements.container = document.createElement('div');
  _elements.container.className = 'imgCropper-container';

  // Image.
  _elements.image = document.createElement('img');
  _elements.image.className = 'imgCropper-image';


  // Target -> Wrapper -> Container -> Image
  _elements.container.appendChild(_elements.image);
  _elements.wrapper.appendChild(_elements.container);
  _elements.target.appendChild(_elements.wrapper);

  if (!this.options.showControls) {
    return this.loadImage();
  }

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

  _elements.controls.crop = document.createElement('button');
  _elements.controls.crop.innerHTML = ' Crop ';

  // Target -> Wrapper -> buttons
  _elements.controls.wrapper.appendChild(_elements.controls.rotateLeft);
  _elements.controls.wrapper.appendChild(_elements.controls.rotateRight);
  _elements.controls.wrapper.appendChild(_elements.controls.zoomIn);
  _elements.controls.wrapper.appendChild(_elements.controls.zoomOut);
  _elements.controls.wrapper.appendChild(_elements.controls.fit);
  _elements.controls.wrapper.appendChild(_elements.controls.crop);
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
 */
Cropper.prototype.setupImageSRC = function() {
  var _image = this.elements.image;

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

  // Waiting the image as loaded to trigger event.
  this.elements.image.onload = function() {
    this.events.triggerHandler('ImageReady');
  }.bind(this);
};

/**
 * Set dimensions.
 */
Cropper.prototype.setDimensions = function() {
  this.zoomInFactor = 1 + this.options.zoomStep;
  this.zoomOutFactor = 1 / this.zoomInFactor;

  this.glltRatio = this.options.height / this.options.width;
  this.width = this.elements.image.naturalWidth / this.options.width;
  this.height = this.elements.image.naturalHeight / this.options.height;
  this.left = 0;
  this.top = 0;
  this.angle = 0;
  this.data = {
    scale: 1,
    degrees: 0,
    x: 0,
    y: 0,
    w: this.options.width,
    h: this.options.height
  };

  // Container.
  this.elements.container.style.width = this.width * 100 + '%';
  this.elements.container.style.height = this.height * 100 + '%';
  this.elements.container.style.top = 0;
  this.elements.container.style.left = 0;

  // Wrapper.
  this.elements.wrapper.style.height = 'auto';
  this.elements.wrapper.style.width = '100%';
  this.elements.wrapper.style.paddingTop = (this.glltRatio * 100) + '%';

  this.isReady = true;
};

/**
 * Image should be already loaded.
 */
Cropper.prototype.initializeGesture = function() {
  var self = this;
  this.addEventListeners(this.elements.image, this.gesture.events.start, function(event) {
    if (self.isReady && self.isValidEvent(event)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      self.pointerPosition = self.getPointerPosition(event);
      bind();
    }
  });

  var bind = function() {
    self.elements.body.classList.add('imgCropper-dragging');
    self.addEventListeners(self.elements.container, self.gesture.events.move, drag);
    self.addEventListeners(self.elements.container, self.gesture.events.stop, unbind);
  };

  var unbind = function() {
    self.elements.body.classList.remove('imgCropper-dragging');
    self.removeEventListeners(self.elements.container, self.gesture.events.move, drag);
    self.removeEventListeners(self.elements.container, self.gesture.events.stop, unbind);
  };

  var drag = function(event) {
    self.dragging.call(self, event);
  };
};

/**
 * Dragging action.
 * @param event
 */
Cropper.prototype.dragging = function(event) {
  var dx, dy, left, p, top;
  event.preventDefault();
  event.stopImmediatePropagation();

  p = this.getPointerPosition(event); // Cursor position after moving.

  dx = p.x - this.pointerPosition.x; // Difference (cursor movement) on X axes.
  dy = p.y - this.pointerPosition.y; // Difference (cursor movement) on Y axes.

  this.pointerPosition = p; // Update cursor position.

  /**
   * dx > 0 if moving right.
   * dx / clientWidth is the percentage of the wrapper's width it moved over X.
   */
  left = (dx === 0)? null : this.left - dx / this.elements.wrapper.clientWidth;

  /**
   * dy > 0 if moving down.
   * dy / clientHeight is the percentage of the wrapper's width it moved over Y.
   */
  top = (dy === 0)? null : this.top - dy / this.elements.wrapper.clientHeight;

  // Move.
  this.setOffset(left, top);
};

/**
 * Set image offset manipulations.
 * @param left {number} is a relative number.
 * @param top {number} is a relative number.
 */
Cropper.prototype.setOffset = function(left, top) {
  /**
   * Offset left.
   */
  if (left || left === 0) {
    if (left < 0) { left = 0; }
    if (left > this.width - 1) { left = this.width - 1; }

    this.elements.container.style.left = (-left * 100).toFixed(2) + '%';
    this.left = left;
    this.data.x = Math.round(left * this.options.width);
  }

  /**
   * Offset top.
   */
  if (top || top === 0) {
    if (top < 0) { top = 0; }
    if (top > this.height - 1) { top = this.height - 1; }

    this.elements.container.style.top = (-top * 100).toFixed(2) + '%';
    this.top = top;
    this.data.y = Math.round(top * this.options.height);
  }
};

Cropper.prototype.fitImage = function() {
  var prevWidth, relativeRatio;

  prevWidth = this.width;
  relativeRatio = this.height / this.width;

  if (relativeRatio > 1) {
    this.width = 1;
    this.height = relativeRatio;
  } else {
    this.width = 1 / relativeRatio;
    this.height = 1;
  }

  this.elements.container.style.width = (this.width * 100).toFixed(2) + '%';
  this.elements.container.style.height = (this.height * 100).toFixed(2) + '%';

  this.data.scale *= this.width / prevWidth;
};

Cropper.prototype.centerImage = function() {
  this.setOffset((this.width - 1) / 2, (this.height - 1) / 2);
};

/**
 * Do a rotation on the image with degrees given.
 * @param degrees
 */
Cropper.prototype.rotateImage = function(degrees) {
  // Only rotate of 90°.
  if (!(degrees !== 0 && degrees % 90 === 0)) {
    return;
  }

  // Smallest positive equivalent angle (total rotation).
  this.angle = (this.angle + degrees) % 360;
  if (this.angle < 0) {
    this.angle += 360;
  }

  // Dimensions are changed?
  if (degrees % 180 !== 0) {
    /**
     * Switch canvas dimensions (as percentages).
     * canvasWidth = @width * glltWidth; canvasHeight = @height * glltHeigth
     * To make canvasWidth = canvasHeight (to switch dimensions):
     * => newWidth * glltWidth = @height * glltHeight
     * => newWidth = @height * glltHeight / glltWidth
     * => newWidth = @height * glltRatio
     */
    var tempW = this.height * this.glltRatio;
    var tempH = this.width / this.glltRatio;
    this.width = tempW;
    this.height = tempH;
    if (this.width >= 1 && this.height >= 1) {
      this.elements.container.style.width = this.width * 100 + '%';
      this.elements.container.style.height = this.height * 100 + '%';
    } else {
      this.fitImage();
    }
  }

  var newWidth = 1;
  var newHeight = 1;

  // Adjust element's (image) dimensions inside the container.
  if (this.angle % 180 !== 0) {
    var ratio = this.height / this.width * this.glltRatio;
    newWidth = ratio;
    newHeight = 1 / ratio;
  }

  this.elements.image.style.width = newWidth * 100 + '%';
  this.elements.image.style.height = newHeight * 100 + '%';
  this.elements.image.style.left = (1 - newWidth) / 2 * 100 + '%';
  this.elements.image.style.top = (1 - newHeight) / 2 * 100 + '%';


  this.elements.image.style.transform = 'rotate(' + this.angle + 'deg)';
  this.centerImage();
  this.data.degrees = this.angle;
};

Cropper.prototype.zoomImage = function(factor) {
  if (factor <= 0 || factor == 1) {
    return;
  }

  var originalWidth = this.width;

  if (this.width * factor > 1 && this.height * factor > 1) {
    this.height *= factor;
    this.width *= factor;
    this.elements.container.style.height = (this.height * 100).toFixed(2) + '%';
    this.elements.container.style.width = (this.width * 100).toFixed(2) + '%';
    this.data.scale *= factor;
  } else {
    this.fitImage();
    factor = this.width / originalWidth;
  }

  /**
   * Keep window center.
   * The offsets are the distances between the image point in the center of the wrapper
   * and each edge of the image, less half the size of the window.
   * Percentage offsets are relative to the container (the wrapper), so half the wrapper
   * is 50% (0.5) and when zooming the distance between any two points in the image
   * grows by 'factor', so the new offsets are:
   *
   * offset = (prev-center-to-edge) * factor - half-window
   *
   */
  var left = (this.left + 0.5) * factor - 0.5;
  var top = (this.top + 0.5) * factor - 0.5;

  this.setOffset(left, top);
};

Cropper.prototype.cropImage = function() {
  this.cropHandler2();
};

Cropper.prototype.cropHandler2 = function() {
  var canvas, context;

  canvas = document.createElement('canvas');
  canvas.height = this.options.height;
  canvas.width = this.options.width;

  context = canvas.getContext('2d');

  context.scale(this.data.scale, this.data.scale);

  //switch (this.angle) {
  //  case 90:
  //    context.translate(0, -this.elements.image.naturalHeight);
  //    context.translate(-this.cropperY / this.cropperScale, this.cropperX / this.cropperScale);
  //    break;
  //  case 180:
  //    context.translate(-this.elements.image.naturalWidth, -this.elements.image.naturalHeight);
  //    context.translate(this.cropperY / this.cropperScale, this.cropperX / this.cropperScale);
  //    break;
  //  case 270:
  //    context.translate(-this.elements.image.naturalWidth, 0);
  //    context.translate(this.cropperY / this.cropperScale, -this.cropperX / this.cropperScale);
  //    break;
  //  default:
  //    context.translate(-this.cropperX / this.cropperScale, this.cropperY / this.cropperScale);
  //}


  //context.translate(-this.cropperX / this.cropperScale, -this.cropperY / this.cropperScale);

  if (this.angle > 0) {

//var arc = this.angle * Math.PI / 180;
//console.log('arc :', arc);
//var sinArc = Math.sin(arc);
//var cosArc = Math.cos(arc);
//
//var newWidth = this.elements.image.naturalWidth * cosArc + this.elements.image.naturalHeight * sinArc;
//var newHeight = this.elements.image.naturalWidth * sinArc + this.elements.image.naturalHeight * cosArc;
//console.log(this.elements.image.naturalWidth, newWidth);
//console.log(this.elements.image.naturalHeight, newHeight);

    // Move to the center of the canvas, before the rotation.
    context.translate(canvas.width/2, canvas.height/2);
    // Do the rotation.
    context.rotate((Math.PI / 180) * this.angle);
    // Move back to its original origin.
    context.translate(-canvas.width/2, -canvas.height/2);


    context.drawImage(this.elements.image,
      // On source image to position the top left point to grab:
      this.data.x / this.data.scale,  // X position from left.
      this.data.y / this.data.scale,  // Y position form top.
      this.elements.image.naturalWidth,  // Width of the rectangle to pick.
      this.elements.image.naturalHeight,  // Height of the rectangle to pick.
      // On the canvas to position the top left point to draw:
      0,  // X position from left
      0,  // Y position from left
      this.elements.image.naturalWidth,  // Width of the rectangle to draw.
      this.elements.image.naturalHeight  // Height of the rectangle to draw.
    );

    //context.translate(-this.cropperX / this.cropperScale, -this.cropperY / this.cropperScale);
    //context.drawImage(this.elements.image, 0, 0);


    // Draw it up and to the left by half the width and height of the image.
    //context.drawImage(this.elements.image,
    //  -this.elements.image.naturalWidth / 2,
    //  -this.elements.image.naturalHeight / 2,
    //  this.elements.image.naturalWidth,
    //  this.elements.image.naturalHeight);

  } else {
    context.drawImage(this.elements.image,
      // On source image to position the top left point to grab:
      this.data.x / this.data.scale,  // X position from left.
      this.data.y / this.data.scale,  // Y position form top.
      this.elements.image.naturalWidth,  // Width of the rectangle to pick.
      this.elements.image.naturalHeight,  // Height of the rectangle to pick.
      // On the canvas to position the top left point to draw:
      0,  // X position from left
      0,  // Y position from left
      this.elements.image.naturalWidth,  // Width of the rectangle to draw.
      this.elements.image.naturalHeight  // Height of the rectangle to draw.
    );
  }

  var image = document.getElementsByClassName('result')[0].childNodes[1];
  image.src = canvas.toDataURL('image/jpeg');
};

Cropper.prototype.useHardwareAccelerate = function(element) {
  element.style.perspective = '1000px';
  element.style.backfaceVisibility = 'hidden';
};

/**
 * Helper for adding new event listener on element given.
 * @param element
 * @param eventNames
 * @param func
 * @param context
 */
Cropper.prototype.addEventListeners = function(element, eventNames, func, context) {
  eventNames.split(' ').forEach(function(eventName) {
    if (context) {
      element.addEventListener(eventName, func.bind(context), false);
    } else {
      element.addEventListener(eventName, func, false);
    }
  });
};

/**
 * Helper for removing event listener in element given.
 * @param element
 * @param eventNames
 * @param func
 * @param context
 */
Cropper.prototype.removeEventListeners = function(element, eventNames, func, context) {
  eventNames.split(' ').forEach(function(eventName) {
    if (context) {
      element.removeEventListener(eventName, func.bind(context), false);
    } else {
      element.removeEventListener(eventName, func, false);
    }
  });
};

/**
 * Helper for setting pointer position.
 * @param {object} event
 * @returns {{x: *, y: *}}
 */
Cropper.prototype.getPointerPosition = function(event) {
  if (this.isTouchEvent(event)) {
    event = event.touches[0];
  }
  return {
    x: event.pageX,
    y: event.pageY
  };
};
/**
 * Helper for testing if the event is valid.
 * TODO: Comment this magic thing.
 * @param event
 * @returns {boolean}
 */
Cropper.prototype.isValidEvent = function(event) {
  if (this.isTouchEvent(event)) {
    return event.changedTouches.length === 1;
  }
  return event.which === 1;
};

/**
 * Helper for testing if the event is touch.
 * @param event
 * @returns {boolean}
 */
Cropper.prototype.isTouchEvent = function(event) {
  return /touch/i.test(event.type);
};

/**
 * Helper for adding a timestamp at the end of an URL.
 * @param url
 * @returns {string}
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
 * @returns {boolean}
 */
Cropper.prototype.isCrossOrigin = function(url) {
  var parts = url.match();

  return Boolean(parts && (
      parts[1] !== location.protocol ||
      parts[2] !== location.hostname ||
      parts[3] !== location.port
    ));
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

/**
 * Helper for events handler.
 */
Cropper.prototype.events = new function() {
  var _triggers = {};

  this.on = function(event, callback) {
    if (!_triggers[event]) {
      _triggers[event] = [];
    }
    _triggers[event].push(callback);
  };

  this.triggerHandler = function(event, params) {
    if (_triggers[event]) {
      for (var i in _triggers[event]) {
        _triggers[event][i](params);
      }
    }
  };
};
