(function(angular) {
    'use strict';

    angular
        .module('imageCropper')
        .constant('defaultConfig', {
            'width': 400,
            'height': 300,
            'zoomStep': 0.1,
            'init': null,
            'showControls': true,
            'fitOnInit': false
    });

})(angular);
