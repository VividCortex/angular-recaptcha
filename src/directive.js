/*global angular, Recaptcha */
(function (ng, Recaptcha) {
    'use strict';

    var app = ng.module('vcRecaptcha');

    app.directive('vcRecaptcha', ['$log', '$timeout', 'vcRecaptchaService', function ($log, $timeout, vcRecaptchaService) {

        return {
            restrict: 'A',
            require: '?ngModel',
            scope: {
                key: '='
            },
            link: function (scope, elm, attrs, ctrl) {

                // $log.info("Creating recaptcha with theme=%s and key=%s", attrs.theme, attrs.key);

                var
                    captcha_created = false,

                    response_input,

                    challenge_input,

                    refresh = function () {
                        if (ctrl) {
                            ctrl.$setViewValue({
                                response: response_input.val(),
                                challenge: challenge_input.val()
                            });
                        }
                    },

                    reload = function () {
                        var inputs      = elm.find('input');
                        challenge_input = angular.element(inputs[0]); // #recaptcha_challenge_field
                        response_input  = angular.element(inputs[1]); // #recaptcha_response_field
                        refresh();
                    },


                    callback = function () {
                        // $log.info('Captcha rendered');

                        reload();

                        response_input.bind('keyup', function () {
                            scope.$apply(refresh);
                        });

                        // model -> view
                        if (ctrl) {
                            ctrl.$render = function () {
                                response_input.val(ctrl.$viewValue.response);
                                challenge_input.val(ctrl.$viewValue.challenge);
                            };
                        }

                        // Capture the click even when the user requests for a new captcha
                        // We give some time for the new captcha to render
                        // This is kind of a hack, we should think on a better way to do this
                        // Probably checking for the image to change and if not, trigger the timeout again
                        elm.bind('click', function () {
                            // $log.info('clicked');
                            $timeout(function () {
                                scope.$apply(reload);
                            }, 1000);
                        });
                    },

                    reloadHandler = Recaptcha.reload;


                if (!attrs.hasOwnProperty('key')) {
                    throw 'You need to set the "key" attribute to your public reCaptcha key. If you don\'t have a key, please get one from https://www.google.com/recaptcha/admin/create';
                }

                scope.$watch('key', function (key, old) {

                    if (key && !captcha_created) {

                        if (key.length !== 40) {
                            throw 'The "key" should be set to your public reCaptcha key. If you don\'t have a key, please get one from https://www.google.com/recaptcha/admin/create';
                        }

                        vcRecaptchaService.create(
                            elm[0],
                            scope.key,
                            callback,
                            {
                                tabindex: attrs.tabindex,
                                theme:    attrs.theme,
                                lang:     attrs.lang || null
                            }
                        );

                        captcha_created = true;
                    }

                });
            }
        };
    }]);

}(angular, Recaptcha));
