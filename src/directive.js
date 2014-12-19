/*global angular, Recaptcha */
(function (ng) {
    'use strict';

    function throwNoKeyException() {
        throw new Error('You need to set the "key" attribute to your public reCaptcha key. If you don\'t have a key, please get one from https://www.google.com/recaptcha/admin/create');
    }

    var app = ng.module('vcRecaptcha');

    app.directive('vcRecaptcha', ['$log', '$timeout', 'vcRecaptchaService', function ($log, $timeout, vcRecaptcha) {

        return {
            restrict: 'A',
            scope: {
                key: '=',
                onCreate: '&',
                onSuccess: '&'
            },
            link: function (scope, elm, attrs) {
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

                    var callback = function () {
                        // Notify about the response availability
                        scope.onSuccess({response: vcRecaptcha.getResponse(scope.widgetId)});
                    };

                    vcRecaptcha.create(elm[0], scope.key, callback, {

                        theme: attrs.theme || null

                    }).then(function (widgetId) {

                        // The widget has been created
                        scope.widgetId = widgetId;
                        scope.onCreate({widgetId: scope.widgetId});
                    });

                    // Remove this listener to avoid creating the widget more than once.
                    removeCreationListener();
                });
            }
        };
    }]);

}(angular));
