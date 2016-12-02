describe('directive: vcRecaptcha', function () {
    'use strict';


    var $scope, $compile, $timeout, vcRecaptchaService,

        TIMEOUT_SESSION_CAPTCHA = 2 * 60 * 1000, // 2 minutes
        VALID_KEY               = '1234567890123456789012345678901234567890';

    beforeEach(function () {
        module('vcRecaptcha');


        inject(function ($rootScope, _$compile_, _$timeout_, _vcRecaptchaService_) {
            $scope   = $rootScope.$new();
            $compile = _$compile_;
            $timeout = _$timeout_;

            vcRecaptchaService = _vcRecaptchaService_;
        });
    });

    describe('invalid key', function () {
        var elementHtml, expectedMessage;

        afterEach(function () {
            expect(function () {
                var element = angular.element(elementHtml);

                $compile(element)($scope);
                $scope.$digest();
            }).toThrow(new Error(expectedMessage));
        });

        it('should throw an error - no key', function () {
            elementHtml     = '<div vc-recaptcha></div>';
            expectedMessage = 'You need to set the "key" attribute to your public reCaptcha key. If you don\'t have a key, please get one from https://www.google.com/recaptcha/admin/create';
        });

        it('should throw an error - key length is not 40 caracters long', function () {
            elementHtml     = '<div vc-recaptcha key="key"></div>';
            expectedMessage = 'You need to set the "key" attribute to your public reCaptcha key. If you don\'t have a key, please get one from https://www.google.com/recaptcha/admin/create';

            $scope.key = 'abc';
        });

        it('should throw an error - key length is not 40 caracters long - key changed', function () {
            elementHtml     = '<div vc-recaptcha key="key"></div>';
            expectedMessage = 'You need to set the "key" attribute to your public reCaptcha key. If you don\'t have a key, please get one from https://www.google.com/recaptcha/admin/create';

            $scope.key = 'abc1';
        });
    });

    describe('widgetId', function () {
        it('should be null at start', function () {
            var element = angular.element('<div vc-recaptcha key="key"></div>');

            $scope.key = VALID_KEY;

            expect(function () {
                $compile(element)($scope);
                $scope.$digest();
            }).not.toThrow();

            expect(element.isolateScope().widgetId).toBeNull();
        });
    });

    describe('form validation', function () {
        beforeEach(function () {
            $scope.key       = VALID_KEY;
            $scope.onCreate  = jasmine.createSpy('onCreate');
            $scope.onSuccess = jasmine.createSpy('onSuccess');
        });

        afterEach(function () {
            expect(vcRecaptchaService.create).toHaveBeenCalled();
        });

        it('should change the validation to false, widget just created', function () {
            var element     = angular.element(
                    '<form name="form">' +
                    '<input type="text" ng-model="something" />' +
                    '<div vc-recaptcha key="key" on-create="onCreate({widgetId: widgetId})" />' +
                    '</form>'
                ),

                _fakeCreate = function () {
                    return {
                        then: function (cb) {
                            var _widgetId = 'a';

                            cb(_widgetId);
                        }
                    };
                };

            spyOn(vcRecaptchaService, 'create').and.callFake(_fakeCreate);

            $compile(element)($scope);
            $scope.$digest();

            expect($scope.form.$valid).toBeFalsy(); // widgetCreated
            expect($scope.onCreate).toHaveBeenCalledWith({widgetId: 'a'});
        });

        it('should change the validation to true - first timeout flushed', function () {
            var element     = angular.element('<form name="form">' +
                    '<input type="text" ng-model="something" />' +
                    '<div vc-recaptcha key="k" on-create="onCreate()" on-success="onSuccess()"/>' +
                    '</form>'),

                _fakeCreate = function (element, config) {
                    config.callback('response from google');

                    return {
                        then: function (cb) {
                            cb();
                        }
                    };
                };

            spyOn(vcRecaptchaService, 'create').and.callFake(_fakeCreate);

            $compile(element)($scope);
            $scope.$digest();

            $timeout.flush(TIMEOUT_SESSION_CAPTCHA - 1);

            expect($scope.form.$valid).toBeTruthy();
        });

        it('should change the validation to false - session expired', function () {
            var element     = angular.element('<form name="form">' +
                    '<input type="text" ng-model="something" />' +
                    '<div vc-recaptcha key="k" on-create="onCreate()" on-success="onSuccess()"/>' +
                    '</form>'),

                _fakeCreate = function (element, config) {
                    // Call the expiration callback as recaptcha would do.
                    config['expired-callback']();

                    return {
                        then: function (cb) {
                            cb();
                        }
                    };
                };

            spyOn(vcRecaptchaService, 'create').and.callFake(_fakeCreate);


            $compile(element)($scope);
            $scope.$digest();

            $timeout.flush(TIMEOUT_SESSION_CAPTCHA + 1);

            expect($scope.form.$valid).toBeFalsy(); // widgetCreated
        });

        it('should call the onSuccess callback with the right params', function () {
            var element     = angular.element('<form name="form">' +
                    '<input type="text" ng-model="something" />' +
                    '<div vc-recaptcha key="key" on-create="onCreate()" on-success="onSuccess({response: response, widgetId: id})"/>' +
                    '</form>'),

                _fakeCreate = function (element, config) {
                    config.callback('response from google');

                    return {
                        then: function (cb) {
                            cb();
                        }
                    };
                };

            spyOn(vcRecaptchaService, 'create').and.callFake(_fakeCreate);

            $compile(element)($scope);
            $scope.$digest();
            $timeout.flush();

            expect($scope.onSuccess).toHaveBeenCalledWith({
                response: 'response from google',
                widgetId: undefined
            });
        });

        it('the widget should be using the setted language', function () {
            var element = angular.element('<form name="form">' +
                    '<input type="text" ng-model="something" />' +
                    '<div vc-recaptcha key="key" on-create="onCreate()" lang="es" on-success="onSuccess({response: response, widgetId: id})"/>' +
                    '</form>'),

                _fakeCreate = function (element, config) {
                    config.callback(config.lang);
                    return {
                        then: function (cb) {
                            cb();
                        }
                    };
                };

            spyOn(vcRecaptchaService, 'create').and.callFake(_fakeCreate);

            $compile(element)($scope);
            $scope.$digest();
            $timeout.flush();

            expect($scope.onSuccess).toHaveBeenCalledWith({
                response: 'es',
                widgetId: undefined
            });
        });
    });
});
