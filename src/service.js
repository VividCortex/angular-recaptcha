/*global angular */
(function (ng) {
    'use strict';

    var app = ng.module('vcRecaptcha');

    /**
     * An angular service to wrap the reCaptcha API
     */
    app.service('vcRecaptchaService', ['$rootScope', '$window', '$q', function ($rootScope, $window, $q) {
        var deferred = $q.defer(), promise = deferred.promise, recaptcha;

        $window.vcRecaptchaApiLoadedCallback = $window.vcRecaptchaApiLoadedCallback || [];

        var callback = function () {
            recaptcha = $window.grecaptcha;

            deferred.resolve(recaptcha);
        };

        $window.vcRecaptchaApiLoadedCallback.push(callback);

        $window.vcRecaptchaApiLoaded = function () {
            $window.vcRecaptchaApiLoadedCallback.forEach(function(callback) {
                callback();
            });
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
            callback();
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

                // Let everyone know this widget has been reset.
                $rootScope.$broadcast('reCaptchaReset', widgetId);
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
