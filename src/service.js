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
