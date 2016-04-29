/**
 * angular-recaptcha build:2016-04-28 
 * https://github.com/vividcortex/angular-recaptcha 
 * Copyright (c) 2016 VividCortex 
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
    app.service('vcRecaptchaService', ['$window', '$q', '$log', '$interval', function ($window, $q, $log, $interval) {
        var recaptcha = null, loaded = false, iterationTimeout = 40;
        
        function getRecaptcha() {
            return $q.when(loaded)
                .then(function () {
                    $log.debug('Returning reCatpcha window object');
                    return recaptcha = $window.grecaptcha;
                })
        }

        function validateRecaptchaInstance() {
            if (!recaptcha) {
                throw new Error('reCaptcha has not been loaded yet.');
            }
        }

        function loadScript(url) {
            loaded = false;
            var deferred = $q.defer();
            // Adding the script tag to the head as suggested before
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;

            function callback() {
                $log.debug('reCaptcha script loaded, waiting for window.grecaptcha');
                var iterations = 0;
                var waitPromise = $interval(function () {
                    iterations++;
                    if (!!$window.grecaptcha) {
                        $interval.cancel(waitPromise);
                        $log.debug('window.grecaptcha exists!');
                        loaded = true;
                        deferred.resolve(script);
                    } else if (iterations >= iterationTimeout) {
                        $interval.cancel(waitPromise);
                        $log.error('TIMEOUT - waiting for window.grecaptcha');
                    }
                }, 250);
            }

            // Then bind the event to the callback function.
            // There are several events for cross browser compatibility.
            script.onreadystatechange = callback;
            script.onload = callback;

            // Fire the loading
            head.appendChild(script);

            //modification so we can remove this after
            return deferred.promise;
        }

        /**
         * Creates a new reCaptcha object
         *
         * @param elm  the DOM element where to put the captcha
         * @param key  the recaptcha public key (refer to the README file if you don't know what this is)
         * @param fn   a callback function to call when the captcha is resolved
         * @param conf the captcha object configuration
         */
        function create(elm, key, fn, conf) {
            conf.callback = fn;
            conf.sitekey = key;

            return getRecaptcha()
                .then(function (recaptcha) {
                    validateRecaptchaInstance();
                    return recaptcha.render(elm, conf);
                });
        }

        /**
         * Reloads the reCaptcha
         */
        function reload(widgetId) {
            validateRecaptchaInstance();

            // $log.info('Reloading captcha');
            recaptcha.reset(widgetId);

            // reCaptcha will call the same callback provided to the
            // create function once this new captcha is resolved.
        }

        /**
         * Gets the response from the reCaptcha widget.
         *
         * @see https://developers.google.com/recaptcha/docs/display#js_api
         *
         * @returns {String}
         */
        function getResponse(widgetId) {
            validateRecaptchaInstance();

            return recaptcha.getResponse(widgetId);
        }

        return {
            create: create,
            reload: reload,
            getResponse: getResponse,
            loadScript: loadScript
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

    app.directive('vcRecaptcha', ['$document', '$timeout', '$log', 'vcRecaptchaService', function ($document, $timeout, $log, vcRecaptchaService) {

        return {
            restrict: 'A',
            require: "?^^form",
            scope: {
                response: '=?ngModel',
                key: '=',
                theme: '=?',
                size: '=?',
                tabindex: '=?',
                onCreate: '&',
                onSuccess: '&',
                onExpire: '&',
                language: '='
            },
            link: function (scope, elm, attrs, ctrl) {
                if (!attrs.hasOwnProperty('key')) {
                    throwNoKeyException();
                }

                scope.widgetId = null;
                scope.script = null;
                scope.removeLanguageListener = null;

                var sessionTimeout;

                scope.removeLanguageListener = scope.$watch('language', function (language) {
                    if (!scope.key || scope.key.length !== 40) {
                        throwNoKeyException();
                    }
                    if (!language) {
                        $log.warn('Language not defined! Using english as fallback');
                        language = 'en';
                    } else {
                        $log.debug('Language changed to: ' + language + ' - Refreshing reCaptcha');
                    }
                    destroy();
                    init(language);
                });

                function init(language) {
                    var url = "https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit&hl=" + language;
                    vcRecaptchaService.loadScript(url)
                        .then(function (loadedScript) {
                            scope.script = loadedScript;


                            var callback = function (gRecaptchaResponse) {
                                // Safe $apply
                                $timeout(function () {
                                    if (ctrl) {
                                        ctrl.$setValidity('recaptcha', true);
                                    }
                                    scope.response = gRecaptchaResponse;
                                    // Notify about the response availability
                                    scope.onSuccess({ response: gRecaptchaResponse, widgetId: scope.widgetId });
                                });

                                // captcha session lasts 2 mins after set.
                                sessionTimeout = $timeout(function () {
                                    if (ctrl) {
                                        ctrl.$setValidity('recaptcha', false);
                                    }
                                    scope.response = "";
                                    // Notify about the response availability
                                    scope.onExpire({ widgetId: scope.widgetId });
                                }, 2 * 60 * 1000);
                            };

                            vcRecaptchaService.create(elm[0], scope.key, callback, {
                                    theme: scope.theme || attrs.theme || null,
                                    tabindex: scope.tabindex || attrs.tabindex || null,
                                    size: scope.size || attrs.size || null
                                })
                                .then(function (widgetId) {
                                    // The widget has been created
                                    if (ctrl) {
                                        ctrl.$setValidity('recaptcha', false);
                                    }
                                    scope.widgetId = widgetId;
                                    scope.onCreate({ widgetId: widgetId });

                                    scope.$on('$destroy', destroy);

                                });

                            if (angular.isUndefined(scope.language)) {
                                //If language was not bound, no need to listen for changes any more
                                scope.removeLanguageListener();
                            }
                        });
                }

                function destroy() {
                    if (ctrl) {
                        // reset the validity of the form if we were removed
                        ctrl.$setValidity('recaptcha', null);
                    }
                    if (sessionTimeout) {
                        // don't trigger the session timeout if we are no longer active
                        $timeout.cancel(sessionTimeout);
                        sessionTimeout = null;
                    }

                    cleanup();
                }

                function cleanup() {
                    // removes elements reCaptcha added.
                    elm.empty();

                    if (scope.script) {
                        angular.element(scope.script).remove();
                    }
                }
            }
        };
    }]);

}(angular));
