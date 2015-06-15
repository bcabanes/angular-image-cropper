(function(angular) {
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
            canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            context = canvas.getContext('2d');

            positions = data;

            deferred = $q.defer();

            image = new Image();
            image.src = source.src;
            image.onload = cropHandler;

            return deferred.promise;
        }

        function cropHandler() {
            context.save();
            context.scale(positions.scale, positions.scale);
            context.rotate(positions.angle * Math.PI / 180);

            if(positions.angle === 90) {
                context.translate(0, -image.height);
                context.translate(-positions.y/positions.scale, positions.x/positions.scale);
            } else if(positions.angle === 180) {
                context.translate(-image.width, -image.height);
                context.translate(positions.x/positions.scale, positions.y/positions.scale);
            } else if(positions.angle === 270) {
                context.translate(-image.width, 0);
                context.translate(positions.y/positions.scale, -positions.x/positions.scale);
            } else {
                context.translate(-positions.x/positions.scale, -positions.y/positions.scale);
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
})(angular);
