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
                onExpire: '&',
				required: '=?ngRequired'
            },
            link: function (scope, elm, attrs, ctrl) {
                if (!attrs.hasOwnProperty('key')) {
                    throwNoKeyException();
                }

                scope.$watch('required', function (required) {
					if(required !== undefined)
                		ctrl.$setValidity('recaptcha', !required);
	            });

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
                                ctrl.$setValidity('recaptcha', true);
                            }
                            scope.response = gRecaptchaResponse;
                            // Notify about the response availability
                            scope.onSuccess({response: gRecaptchaResponse, widgetId: scope.widgetId});
                        });

                        // captcha session lasts 2 mins after set.
                        $timeout(function (){
                        	if (ctrl) {
                        		var valid = (scope.required !== undefined) ? !scope.required : false;
                        		ctrl.$setValidity('recaptcha', valid);
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
                    	if (ctrl) {
		                    var valid = (scope.required !== undefined) ? !scope.required : false;
		                    ctrl.$setValidity('recaptcha', valid);
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