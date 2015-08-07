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

    function directive(Cropper, defaultConfig, Helper) {
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
            'template': ['<div class="frame">',
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
                '</div>'].join(''),
            'link': link
        };

        function link(scope, element, attributes) {
            var gEnabled = false;

            var body = angular.element('body');

            var gImage = element.find('img');
            var gCanvas = element.find('.imgCropper-canvas');
            var gWindow = element.find('.imgCropper-window');

            /**
             * Merge default with attributes given
             */
            var options = {};
            options.width = Number(scope.destWidth) || defaultConfig.width;
            options.height = Number(scope.destHeight) || defaultConfig.height;
            options.zoomStep = Number(scope.zoomStep) || defaultConfig.zoomStep;
            options.init = scope.init || defaultConfig.init;
            options.fitOnInit = scope.fitOnInit || defaultConfig.fitOnInit;

            var zoomInFactor = 1 + options.zoomStep;
            var zoomOutFactor = 1 / zoomInFactor;

            var imgCopperRatio = options.height / options.width;

            var gWidth, gHeight, gLeft, gTop, gAngle;
            gWidth = gHeight = gLeft = gTop = gAngle = 0;

            var gData = {
                'scale': 1,
                'angle': 0,
                'x': 0,
                'y': 0,
                'w': options.width,
                'h': options.height
            };

            var events = {
                'start': 'touchstart mousedown',
                'move': 'touchmove mousemove',
                'stop': 'touchend mouseup'
            };

            var pointerPosition;

            /**
             * -------------------
             */

            var setWrapper = function() {
                gWidth = gImage[0].naturalWidth / options.width;
                gHeight = gImage[0].naturalHeight / options.height;

                gCanvas.css({
                    'width': gWidth * 100 + '%',
                    'height': gHeight * 100 + '%',
                    'top': 0,
                    'left': 0
                });

                gWindow.css({
                    'width': '100%',
                    'height': 'auto',
                    'padding-top': (options.height / options.width * 100) + '%'
                });

                // Ready to process
                gEnabled = true;
            };

            // events
            var start = function(e) {
                if(!(gEnabled && Helper.validEvent(e))) {
                    return;
                }
                e.preventDefault();
                e.stopImmediatePropagation();
                pointerPosition = Helper.getPointerPosition(e);
                return bind();
            };

            var bind = function() {
                body.addClass('imgCropper-dragging');
                gCanvas.on(events.move, drag);
                return gCanvas.on(events.stop, unbind);
            };

            var unbind = function(e) {
                body.removeClass('imgCropper-dragging');
                gCanvas.off(events.move, drag);
                gCanvas.off(events.stop, unbind);
            };

            var offset = function(left, top) {
                if(left || left === 0) {
                    if(left < 0) {
                        left = 0;
                    }

                    if(left > gWidth - 1) {
                        left = gWidth - 1;
                    }

                    gCanvas[0].style.left = (-left * 100).toFixed(2) + '%';
                    gLeft = left;
                    gData.x = Math.round(left * options.width);
                }

                if(top || top === 0) {
                    if(top < 0) {
                        top = 0;
                    }

                    if(top > gHeight - 1) {
                        top = gHeight - 1;
                    }

                    gCanvas[0].style.top = (-top * 100).toFixed(2) + '%';
                    gTop = top;
                    gData.y = Math.round(top * options.height);
                }

                return getCroppedImage();
            };

            // actions
            var drag = function(e) {
                var dx, dy, left, p, top;
                e.preventDefault();
                e.stopImmediatePropagation();
                p = Helper.getPointerPosition(e);
                dx = p.x - pointerPosition.x;
                dy = p.y - pointerPosition.y;
                pointerPosition = p;
                left = dx === 0 ? null : gLeft - dx / gWindow[0].clientWidth;
                top = dy === 0 ? null : gTop - dy / gWindow[0].clientHeight;
                return offset(left, top);
            };

            var zoom = function(factor) {
                var h, left, top, w;
                if(factor <= 0 || factor === 1) {
                    return;
                }

                w = gWidth;
                h = gHeight;

                if(w * factor > 1 && h * factor > 1) {
                    gWidth *= factor;
                    gHeight *= factor;
                    gCanvas[0].style.width = (gWidth * 100).toFixed(2) + '%';
                    gCanvas[0].style.height = (gHeight * 100).toFixed(2) + '%';
                    gData.scale *= factor;
                }else{
                    fit();
                    factor = gWidth / w;
                }

                left = (gLeft + 0.5) * factor - 0.5;
                top = (gTop + 0.5) * factor - 0.5;
                return offset(left, top);
            };

            var fit = function() {
                var prevWidth, relativeRatio;

                prevWidth = gWidth;
                relativeRatio = gHeight / gWidth;

                if(relativeRatio > 1) {
                    gWidth = 1;
                    gHeight = relativeRatio;
                }else{
                    gWidth = 1 / relativeRatio;
                    gHeight = 1;
                }

                gCanvas[0].style.width = (gWidth * 100).toFixed(2) + '%';
                gCanvas[0].style.height = (gHeight * 100).toFixed(2) + '%';

                gData.scale *= gWidth / prevWidth;

                return getCroppedImage();
            };

            var center = function() {
                return offset((gWidth - 1) / 2, (gHeight - 1) / 2);
            };

            var rotate = function(angle) {
                var canvasRatio, h, w, _ref, _ref1, _ref2;

                if(!Helper.canTransform()) {
                    return;
                }

                if(!(angle !== 0 && angle % 90 === 0)) {
                    return;
                }

                gAngle = (gAngle + angle) % 360;

                if(gAngle < 0) {
                    gAngle = 360 + gAngle;
                }

                if(angle % 180 !== 0) {
                    _ref = [gHeight * imgCopperRatio, gWidth / imgCopperRatio];
                    gWidth = _ref[0];
                    gHeight = _ref[1];

                    if(gWidth >= 1 && gHeight >= 1) {
                        gCanvas[0].style.width = gWidth * 100 + '%';
                        gCanvas[0].style.height = gHeight * 100 + '%';
                    } else {
                        fit();
                    }
                }

                _ref1 = [1, 1];
                w = _ref1[0];
                h = _ref1[1];

                if(gAngle % 180 !== 0) {
                    canvasRatio = gHeight / gWidth * imgCopperRatio;
                    _ref2 = [canvasRatio, 1 / canvasRatio];
                    w = _ref2[0];
                    h = _ref2[1];
                }

                gImage[0].style.width = w * 100 + '%';
                gImage[0].style.height = h * 100 + '%';
                gImage[0].style.left = (1 - w) / 2 * 100 + '%';
                gImage[0].style.top = (1 - h) / 2 * 100 + '%';
                gImage.css({
                    'transform': "rotate(" + gAngle + "deg)"
                });

                center();

                gData.angle = gAngle;

                return getCroppedImage();
            };

            // buttons
            scope.rotateLeft = function() {
                rotate(-90);
            };
            scope.rotateRight = function() {
                rotate(90);
            };
            scope.center = function() {
                center();
            };
            scope.fit = function() {
                fit();
                center();
            };
            scope.zoomIn = function() {
                zoom(zoomInFactor);
            };
            scope.zoomOut = function() {
                zoom(zoomOutFactor);
                getCroppedImage();
            };


            var getCroppedImage = function() {
                Cropper
                    .crop(gImage[0], gData, options.width, options.height)
                    .then(function(data) {
                        scope.croppedImage = data;
                    });
            };

            // calls
            gImage[0].onload = function() {
                var thisImage = this;
                setWrapper();
                hardwareAccelerate(gImage);
                if (thisImage.naturalWidth < options.width || thisImage.naturalHeight < options.height || options.fitOnInit)
                    fit();
                center();
                element.find('img').on(events.start, start);
                getCroppedImage();

            };

            var hardwareAccelerate = function(el) {
                return angular.element(el).css({
                    '-webkit-perspective': 1000,
                    'perspective': 1000,
                    '-webkit-backface-visibility': 'hidden',
                    'backface-visibility': 'hidden'
                });
            };

        }
    }
})(angular);
