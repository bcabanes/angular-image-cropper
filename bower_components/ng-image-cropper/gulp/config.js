(function() {
    'use strict';

    module.exports = {
        'browsers': [
            'ie >= 10',
            'ie_mob >= 10',
            'ff >= 30',
            'chrome >= 34',
            'safari >= 7',
            'opera >= 23',
            'ios >= 7',
            'android >= 4.4',
            'bb >= 10'
        ],
        'paths': {
            'html': {
                'src': 'dev/js/angular-image-cropper/**/*.tpl.html'
            },
            'styles': {
                'src': 'dev/assets/styles/scss/angular-image-cropper.scss',
                'main': 'dev/assets/styles/scss/angular-image-cropper.scss',
                'dest': 'dev/assets/styles/css/'
            },
            'scripts': {
                'src': 'dev/js/angular-image-cropper/**/*.js'
            }
        }
    };

})();
