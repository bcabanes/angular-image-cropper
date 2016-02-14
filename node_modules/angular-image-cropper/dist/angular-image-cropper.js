(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("angular"));
	else if(typeof define === 'function' && define.amd)
		define(["angular"], factory);
	else if(typeof exports === 'object')
		exports["imageCropper"] = factory(require("angular"));
	else
		root["imageCropper"] = factory(root["angular"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var angular = __webpack_require__(1);
	
	var ngModule = angular.module('imageCropper', []);
	
	var Cropper = __webpack_require__(2);
	__webpack_require__(3)(angular, Cropper);
	
	module.exports = 'imageCropper';

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = Cropper;
	
	/**
	 * Cropper.
	 * @param options
	 * @returns {Cropper}
	 * @constructor
	 */
	function Cropper(options) {
	
	  if (!options.imageUrl) {
	    throw new Error('Cropper: No image url given.');
	  }
	
	  this.isReady = false;
	  this.originalUrl = options.imageUrl;
	
	  // Default options.
	  var defaults = {
	    checkCrossOrigin: false,
	    apiCallback: undefined,
	    cropCallback: undefined,
	    width: 400,
	    height: 300,
	    imageUrl: undefined,
	    target: undefined,
	    showControls: true,
	    fitOnInit: false,
	    centerOnInit: false,
	    zoomStep: 0.1,
	    actionLabels: {
	      rotateLeft: ' < ',
	      rotateRight: ' > ',
	      zoomIn: ' + ',
	      zoomOut: ' - ',
	      fit: '(fit)',
	      crop: '[crop]'
	    }
	  };
	
	  // Setup options.
	  this.options = this.extend(defaults, options);
	
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
	
	  // API Setup:
	  var api = {
	    crop: this.cropImage.bind(this),
	    fit: this.applyFit.bind(this),
	    rotate: this.applyRotation.bind(this),
	    zoom: this.applyZoom.bind(this),
	    remove: this.remove.bind(this)
	  };
	
	  /**
	   * Initialization of the Cropper (dimensions, event binding...).
	   */
	  this.events.on('ImageReady', this.initialize.bind(this));
	
	  /**
	   * Execute callback function when cropped.
	   */
	  if (this.options.cropCallback) {
	    this.events.on('Cropped', function(base64) {
	      this.options.cropCallback(base64);
	    }.bind(this));
	  }
	
	  /**
	   * Send API when image is ready if readyCallback is true.
	   */
	  if (this.options.apiCallback) {
	    this.events.on('ImageReady', function() {
	      this.options.apiCallback(api);
	    }.bind(this));
	  }
	}
	
	Cropper.prototype.initialize = function() {
	  this.setDimensions();
	
	  if (this.imageHasToFit()) {
	    this.fitImage();
	    this.centerImage();
	  }
	  this.initializeGesture();
	
	  if (this.options.centerOnInit) {
	    this.centerImage();
	  }
	
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
	    this.width < 1 || this.height < 1 || // 1 means 100%.
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
	  _elements.controls.rotateLeft.innerHTML = this.options.actionLabels.rotateLeft;
	  _elements.controls.rotateRight = document.createElement('button');
	  _elements.controls.rotateRight.innerHTML = this.options.actionLabels.rotateRight;
	  _elements.controls.zoomIn = document.createElement('button');
	  _elements.controls.zoomIn.innerHTML = this.options.actionLabels.zoomIn;
	  _elements.controls.zoomOut = document.createElement('button');
	  _elements.controls.zoomOut.innerHTML = this.options.actionLabels.zoomOut;
	  _elements.controls.fit = document.createElement('button');
	  _elements.controls.fit.innerHTML = this.options.actionLabels.fit;
	
	  _elements.controls.crop = document.createElement('button');
	  _elements.controls.crop.innerHTML = this.options.actionLabels.crop;
	
	  // Target -> Wrapper -> buttons
	  _elements.controls.wrapper.appendChild(_elements.controls.rotateLeft);
	  _elements.controls.wrapper.appendChild(_elements.controls.zoomOut);
	  _elements.controls.wrapper.appendChild(_elements.controls.fit);
	  _elements.controls.wrapper.appendChild(_elements.controls.crop);
	  _elements.controls.wrapper.appendChild(_elements.controls.zoomIn);
	  _elements.controls.wrapper.appendChild(_elements.controls.rotateRight);
	  _elements.target.appendChild(_elements.controls.wrapper);
	
	  this.loadImage();
	};
	
	/**
	 * Remove all DOM element parts of the Cropper.
	 */
	Cropper.prototype.remove = function() {
	  var elements = this.elements;
	  elements.target.removeChild(elements.wrapper);
	  elements.target.removeChild(elements.controls.wrapper);
	};
	
	Cropper.prototype.loadImage = function() {
	  var self = this;
	  var xhr;
	
	  // XMLHttpRequest disallows to open a Data URL in some browsers like IE11 and Safari.
	  if (/^data\:/.test(this.originalUrl)) {
	    this.originalBase64 = this.originalUrl;
	    return this.setupImageSRC();
	  }
	
	  xhr = new XMLHttpRequest();
	  xhr.onerror = xhr.onabort = function(response) {
	    self.originalBase64 = self.originalUrl;
	    self.setupImageSRC();
	  };
	
	  // Need to have proper sets of 'Access-Control-Allow-Origin' on the requested resource server.
	  xhr.onload = function() {
	    self.originalArrayBuffer = this.response;
	    self.originalBase64 = 'data:image/jpeg;base64,' + self.base64ArrayBuffer(this.response);
	    self.setupImageSRC();
	  };
	  xhr.open('get', this.originalUrl, true);
	  //xhr.setRequestHeader('Content-Type', 'image/jpg'); // TODO: Auto determine the image MIME's type.
	  xhr.responseType = 'arraybuffer';
	  xhr.send();
	};
	
	/**
	 * Check crossOrigins and setup image src.
	 */
	Cropper.prototype.setupImageSRC = function() {
	  var _image = this.elements.image;
	
	  if (this.options.checkCrossOrigin && this.isCrossOrigin(this.originalUrl)) {
	    this.crossOrigin = _image.crossOrigin;
	
	    if (this.crossOrigin) {
	      this.crossOrigin = this.originalUrl;
	    } else {
	      this.crossOrigin = 'anonymous';
	
	      // Bust cache with a timestamp.
	      this.crossOriginUrl = this.addTimestamp(this.originalUrl);
	    }
	  }
	
	  if (this.crossOrigin) {
	    this.elements.image.crossOrigin = this.crossOrigin;
	  }
	
	  // Setup image src.
	  this.elements.image.src = this.crossOriginUrl || this.originalUrl; // Need to verify.
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
	
	  this.imageRatio = this.options.height / this.options.width;
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
	  this.elements.wrapper.style.paddingTop = (this.imageRatio * 100) + '%';
	
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
	    self.addEventListeners(self.elements.body, self.gesture.events.move, drag);
	    self.addEventListeners(self.elements.body, self.gesture.events.stop, unbind);
	  };
	
	  var unbind = function() {
	    self.elements.body.classList.remove('imgCropper-dragging');
	    self.removeEventListeners(self.elements.body, self.gesture.events.move, drag);
	    self.removeEventListeners(self.elements.body, self.gesture.events.stop, unbind);
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
	    throw new Error('Cropper: Support only multiple of 90° for rotation.');
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
	     * canvasWidth = @width * this.options.width; canvasHeight = @height * this.options.height
	     * To make canvasWidth = canvasHeight (to switch dimensions):
	     * => newWidth * this.options.width = @height * this.options.height
	     * => newWidth = @height * this.options.height / this.options.width
	     * => newWidth = @height * this.imageRatio
	     */
	    var tempW = this.height * this.imageRatio;
	    var tempH = this.width / this.imageRatio;
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
	    var ratio = this.height / this.width * this.imageRatio;
	    newWidth = ratio;
	    newHeight = 1 / ratio;
	  }
	
	  this.elements.image.style.width = newWidth * 100 + '%';
	  this.elements.image.style.height = newHeight * 100 + '%';
	  this.elements.image.style.left = (1 - newWidth) / 2 * 100 + '%';
	  this.elements.image.style.top = (1 - newHeight) / 2 * 100 + '%';
	
	
	  this.elements.image.style.transform = 'rotate(' + this.angle + 'deg)';
	  this.elements.image.style.webkitTransform = 'rotate(' + this.angle + 'deg)';
	  this.elements.image.style.mozTransform = 'rotate(' + this.angle + 'deg)';
	  this.elements.image.style.msTransform = 'rotate(' + this.angle + 'deg)';
	  this.elements.image.style.oTransform = 'rotate(' + this.angle + 'deg)';
	
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
	  return this.cropHandler();
	};
	
	Cropper.prototype.cropHandler = function() {
	  var canvas, context;
	
	  canvas = document.createElement('canvas');
	  canvas.height = this.options.height;
	  canvas.width = this.options.width;
	
	  var cx = -canvas.width / 2;
	  var cy = -canvas.height / 2;
	
	  context = canvas.getContext('2d');
	  context.translate(-cx,-cy); //move to centre of canvas
	  context.rotate(this.data.degrees * Math.PI/180);
	  context.scale(this.data.scale, this.data.scale);
	
	  if(this.data.degrees == 0) { // simple offsets from canvas centre & scale
	    context.drawImage(this.elements.image,
	      (cx - this.data.x) / this.data.scale,
	      (cy - this.data.y) / this.data.scale
	    );
	  } else if(this.data.degrees == 90) { // swap axis and reverse the new y origin
	    context.drawImage(this.elements.image,
	      (cy - this.data.y) / this.data.scale,
	      (-1 * this.elements.image.naturalHeight) + ((-cx + this.data.x) / this.data.scale)
	    );
	  } else if(this.data.degrees == 180) { // reverse both origins
	    context.drawImage(this.elements.image,
	      (-1 * this.elements.image.naturalWidth) + ((-cx + this.data.x) / this.data.scale),
	      (-1 * this.elements.image.naturalHeight) + ((-cy + this.data.y) / this.data.scale)
	    );
	  } else if(this.data.degrees == 270) { // swap axis and reverse the new x origin
	    context.drawImage(this.elements.image,
	      (-1 * this.elements.image.naturalWidth) + ((-cy + this.data.y) / this.data.scale),
	      (cx - this.data.x) / this.data.scale
	    );
	  }
	
	  var base64 = canvas.toDataURL('image/jpeg');
	  this.events.triggerHandler('Cropped', base64);
	  return base64;
	};
	
	Cropper.prototype.useHardwareAccelerate = function(element) {
	  element.style.perspective = '1000px';
	  element.style.backfaceVisibility = 'hidden';
	};
	
	Cropper.prototype.extend = function(defaults, options) {
	  var target = defaults;
	  var defaultsKeys = Object.keys(defaults);
	
	  defaultsKeys.forEach(function(key, index, keysArray) {
	    if (options[key] !== undefined) {
	      target[key] = options[key];
	    }
	  });
	
	  return target;
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


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	if (false) {
	  require('./imageCropperDirective.test.js')(angular);
	}
	
	module.exports = function(angular, Cropper) {
	  __webpack_require__(4);
	  angular
	    .module('imageCropper')
	    .directive('imageCropper', function() {
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
	        controller: function() {
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
	          }
	        },
	        'link': function(scope, element, attributes, controller) {
	          controller.element = element[0];
	          controller.init();
	        }
	      };
	    });
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(5);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(7)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/css-loader/index.js!./../node_modules/sass-loader/index.js!./angular-image-cropper.scss", function() {
				var newContent = require("!!./../node_modules/css-loader/index.js!./../node_modules/sass-loader/index.js!./angular-image-cropper.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(6)();
	// imports
	
	
	// module
	exports.push([module.id, "body.imgCropper-dragging, body.imgCropper-dragging * {\n  cursor: move !important;\n  cursor: -webkit-grabbing !important;\n  cursor: -moz-grabbing !important;\n  cursor: grabbing !important;\n  cursor: grabbing, move;\n  /* IE hack */ }\n\n.imgCropper-wrapper {\n  display: block;\n  position: relative;\n  overflow: hidden;\n  cursor: move;\n  cursor: -webkit-grab;\n  cursor: -moz-grab;\n  cursor: grab;\n  cursor: grab, move;\n  /* IE hack */ }\n\n.imgCropper-container {\n  position: absolute;\n  top: 0;\n  left: 0;\n  text-align: center;\n  margin: 0 !important;\n  padding: 0 !important;\n  border: none !important; }\n\n.imgCropper-container > * {\n  position: absolute;\n  top: 0;\n  left: 0;\n  max-width: none;\n  max-height: none;\n  width: 100%;\n  height: 100%;\n  margin: 0 !important;\n  padding: 0 !important;\n  border: none !important; }\n\n.imgCropper-sample {\n  position: absolute !important;\n  top: -100000px     !important;\n  left: -100000px    !important;\n  width: auto        !important;\n  height: auto       !important; }\n", ""]);
	
	// exports


/***/ },
/* 6 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];
	
		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};
	
		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];
	
	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}
	
		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();
	
		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";
	
		var styles = listToStyles(list);
		addStylesToDom(styles, options);
	
		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}
	
	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}
	
	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}
	
	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}
	
	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}
	
	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}
	
	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}
	
	function addStyle(obj, options) {
		var styleElement, update, remove;
	
		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}
	
		update(obj);
	
		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}
	
	var replaceText = (function () {
		var textStore = [];
	
		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();
	
	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;
	
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}
	
	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;
	
		if(media) {
			styleElement.setAttribute("media", media)
		}
	
		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}
	
	function updateLink(linkElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;
	
		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}
	
		var blob = new Blob([css], { type: "text/css" });
	
		var oldSrc = linkElement.href;
	
		linkElement.href = URL.createObjectURL(blob);
	
		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ }
/******/ ])
});
;
//# sourceMappingURL=angular-image-cropper.js.map