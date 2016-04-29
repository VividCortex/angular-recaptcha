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
