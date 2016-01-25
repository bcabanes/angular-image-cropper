(function (angular) {
  'use strict';
  angular
    .module('imageCropper')
    .factory('Cropper', factory);
  factory.$inject = [
    'Helper',
    '$q'
  ];
  function factory(Helper, $q) {
    var canvas,
      context,
      image,
      positions,
      imageCropped,
      deferred;
    var service = {
      'crop': initialize,
      'get': getImage
    };
    return service;
    /**
     * METHODS
     */

    function initialize(source, data, width, height) {

      // XMLHttpRequest disallows to open a Data URL in some browsers like IE11 and Safari.
      if (!/^data\:/.test(source.src)) {
        var xhr = new XMLHttpRequest();
        xhr.onerror = xhr.onabort = function (response) {
          console.error('XMLHttpRequest', response);
        };
        // Needs to have 'Access-Control-Allow-Origin' header is present on the requested resource.
        xhr.onload = function () {
//console.log(this.response);
          createCanvas(this.response, {
            image: source,
            data: data,
            width: width,
            height: height
          });
        };
        xhr.open('get', source.src, true);
        xhr.setRequestHeader('Content-Type', 'image/jpg');
        xhr.responseType = 'arraybuffer';
        xhr.send();
        console.log(xhr);
      }
      deferred = $q.defer();
      return deferred.promise;
    }

    function createCanvas(arrayBuffer, options) {
      canvas = document.createElement('canvas');
      canvas.width = options.width;
      canvas.height = options.height;
      context = canvas.getContext('2d');
      positions = options.data;
      image = new Image();
      var base64 = 'data:image/jpeg;base64,' + base64ArrayBuffer(arrayBuffer);
      image.src = base64;
      image.onload = cropHandler;
    }

    function cropHandler() {
      context.save();
      context.scale(positions.scale, positions.scale);
      context.rotate(positions.angle * Math.PI / 180);
      if (positions.angle === 90) {
        context.translate(0, -image.height);
        context.translate(-positions.y / positions.scale, positions.x / positions.scale);
      } else if (positions.angle === 180) {
        context.translate(-image.width, -image.height);
        context.translate(positions.x / positions.scale, positions.y / positions.scale);
      } else if (positions.angle === 270) {
        context.translate(-image.width, 0);
        context.translate(positions.y / positions.scale, -positions.x / positions.scale);
      } else {
        context.translate(-positions.x / positions.scale, -positions.y / positions.scale);
      }
      context.drawImage(image, 0, 0);
      context.restore();
      imageCropped = canvas.toDataURL('image/jpeg');
      return deferred.resolve(imageCropped);
    }

    function getImage() {
      return imageCropped;
    }
  }

  function base64ArrayBuffer(arrayBuffer) {
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
  }
})(angular);
