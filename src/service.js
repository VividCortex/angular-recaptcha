/*global angular, Recaptcha */
(function (ng, Recaptcha) {
    'use strict';

    var app = ng.module('vcRecaptcha');

    /**
     * An angular service to wrap the reCaptcha API
     */
    app.service('vcRecaptchaService', ['$timeout', '$log', function ($timeout, $log) {

        /**
         * The reCaptcha callback
         */
        var callback;

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
                callback = fn;
                Recaptcha.create(
                    key,
                    elm,
                    conf
                );
            },

            /**
             * Reloads the captcha (updates the challenge)
             *
             * @param should_focus pass TRUE if the repatcha should gain the focus after reloading
             */
            reload: function (should_focus) {
                // $log.info('Reloading captcha');
                Recaptcha.reload(should_focus && 't');

                // Since the previous call is asynch, we need again the same hack. See directive code.
                // TODO: Investigate another way to know when the new captcha is loaded
                $timeout(callback, 1000);
            }
        };

    }]);

}(angular, Recaptcha));
