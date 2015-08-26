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
                size: '=?',
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

                var sessionTimeout;
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
                        sessionTimeout = $timeout(function (){
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
                        tabindex: scope.tabindex || attrs.tabindex || null,
                        size: scope.size || attrs.size || null

                    }).then(function (widgetId) {
                        // The widget has been created
                        if(ctrl){
                            ctrl.$setValidity('recaptcha',false);
                        }
                        scope.widgetId = widgetId;
                        scope.onCreate({widgetId: widgetId});

                        scope.$on('$destroy', destroy);

                    });

                    // Remove this listener to avoid creating the widget more than once.
                    removeCreationListener();
                });

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

                function cleanup(){
                  // removes elements reCaptcha added.
                  angular.element($document[0].querySelectorAll('.pls-container')).parent().remove();
                }
            }
        };
    }]);

}(angular));
