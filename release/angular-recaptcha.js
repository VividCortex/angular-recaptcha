/**
 * angular-recaptcha build:2015-04-28 
 * https://github.com/vividcortex/angular-recaptcha 
 * Copyright (c) 2015 VividCortex 
**/

/*global angular, Recaptcha */
(function (ng) {
    'use strict';

    ng.module('vcRecaptcha', []);

}(angular));

/*global angular */
(function (ng) {
    'use strict';

    var app = ng.module('vcRecaptcha');

    /**
     * An angular service to wrap the reCaptcha API
     */
    app.service('vcRecaptchaService', ['$window', '$q', function ($window, $q) {
        var deferred = $q.defer(), promise = deferred.promise, recaptcha;

        $window.vcRecaptchaApiLoaded = function () {
            recaptcha = $window.grecaptcha;

            deferred.resolve(recaptcha);
        };


        function getRecaptcha() {
            if (!!recaptcha) {
                return $q.when(recaptcha);
            }

            return promise;
        }

        function validateRecaptchaInstance() {
            if (!recaptcha) {
                throw new Error('reCaptcha has not been loaded yet.');
            }
        }


        // Check if grecaptcha is not defined already.
        if (ng.isDefined($window.grecaptcha)) {
            $window.vcRecaptchaApiLoaded();
        }

        return {

            /**
             * Creates a new reCaptcha object
             *
             * @param elm  the DOM element where to put the captcha
             * @param key  the recaptcha public key (refer to the README file if you don't know what this is)
             * @param fn   a callback function to call when the captcha is resolved
             * @param conf the captcha object configuration
             */
            create: function (elm, key, fn, conf) {
                conf.callback = fn;
                conf.sitekey = key;

                return getRecaptcha().then(function (recaptcha) {
                    return recaptcha.render(elm, conf);
                });
            },

            /**
             * Reloads the reCaptcha
             */
            reload: function (widgetId) {
                validateRecaptchaInstance();

                // $log.info('Reloading captcha');
                recaptcha.reset(widgetId);

                // reCaptcha will call the same callback provided to the
                // create function once this new captcha is resolved.
            },

            /**
             * Gets the response from the reCaptcha widget.
             *
             * @see https://developers.google.com/recaptcha/docs/display#js_api
             *
             * @returns {String}
             */
            getResponse: function (widgetId) {
                validateRecaptchaInstance();

                return recaptcha.getResponse(widgetId);
            }
        };

    }]);

}(angular));

/*global angular, Recaptcha */
(function (ng) {
    'use strict';

    function throwNoKeyException() {
        throw new Error('You need to set the "key" attribute to your public reCaptcha key. If you don\'t have a key, please get one from https://www.google.com/recaptcha/admin/create');
    }

    var app = ng.module('vcRecaptcha');

    app.directive('vcRecaptcha', ['$document', '$timeout', 'vcRecaptchaService', function ($document, $timeout, vcRecaptcha) {

        return {
            restrict: 'A',
            require: "?^^form",
            scope: {
                response: '=?ngModel',
                key: '=',
                theme: '=?',
                tabindex: '=?',
                onCreate: '&',
                onSuccess: '&',
                onExpire: '&'
            },
            link: function (scope, elm, attrs, ctrl) {
                if (!attrs.hasOwnProperty('key')) {
                    throwNoKeyException();
                }

                scope.widgetId = null;

                var removeCreationListener = scope.$watch('key', function (key) {
                    if (!key) {
                        return;
                    }

                    if (key.length !== 40) {
                        throwNoKeyException();
                    }

                    var callback = function (gRecaptchaResponse) {
                        // Safe $apply
                        $timeout(function () {
                            if(ctrl){
                                ctrl.$setValidity('recaptcha',true);
                            }
                            scope.response = gRecaptchaResponse;
                            // Notify about the response availability
                            scope.onSuccess({response: gRecaptchaResponse, widgetId: scope.widgetId});
                        });

                        // captcha session lasts 2 mins after set.
                        $timeout(function (){
                            if(ctrl){
                                ctrl.$setValidity('recaptcha',false);
                            }
                            scope.response = "";
                            // Notify about the response availability
                            scope.onExpire({widgetId: scope.widgetId});
                        }, 2 * 60 * 1000);
                    };

                    vcRecaptcha.create(elm[0], key, callback, {

                        theme: scope.theme || attrs.theme || null,
                        tabindex: scope.tabindex || attrs.tabindex || null

                    }).then(function (widgetId) {
                        // The widget has been created
                        if(ctrl){
                            ctrl.$setValidity('recaptcha',false);
                        }
                        scope.widgetId = widgetId;
                        scope.onCreate({widgetId: widgetId});

                        scope.$on('$destroy', cleanup);

                    });

                    // Remove this listener to avoid creating the widget more than once.
                    removeCreationListener();
                });

                function cleanup(){
                  // removes elements reCaptcha added.
                  angular.element($document[0].querySelectorAll('.pls-container')).parent().remove();
                }
            }
        };
    }]);

}(angular));
