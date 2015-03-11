"use strict";

describe('directive: vcRecaptcha', function()
{
    var _rootScope, _scope, _compile, _element, _timeoutMock, _vcRecaptchaService;
    var TIMEOUT_SESSION_CAPTCHA = 2 * 60 * 1000; // 2 minutes
    var VALID_KEY = "1234567890123456789012345678901234567890";

    beforeEach(module('vcRecaptcha'));

    beforeEach(inject(function($injector)
    {
        _rootScope = $injector.get('$rootScope');
        _scope = _rootScope.$new();
        _compile = $injector.get('$compile');
        _timeoutMock = $injector.get('$timeout');
        _vcRecaptchaService = $injector.get('vcRecaptchaService');
    }));

    describe('key', function()
    {
        it('should throw an error - no key', function()
        {
            var _html = '<div vc-recaptcha></div>';

            _element = angular.element(_html);

            expect(function()
            {
                _compile(_element)(_scope);
                _scope.$digest();
            }).toThrow(new Error('You need to set the "key" attribute to your public reCaptcha key. If you don\'t have a key, please get one from https://www.google.com/recaptcha/admin/create'));
        })

        it('should throw an error - key length is not 40 caracters long', function()
        {
            _scope.k = "abc";

            var _html = '<div vc-recaptcha key="k"></div>';

            _element = angular.element(_html);

            expect(function()
            {
                _compile(_element)(_scope);
                _scope.$digest();
            }).toThrow(new Error('You need to set the "key" attribute to your public reCaptcha key. If you don\'t have a key, please get one from https://www.google.com/recaptcha/admin/create'));
        })

        it('should throw an error - key length is not 40 caracters long - key changed', function()
        {
            _scope.k = "abc";

            var _html = '<div vc-recaptcha key="k"></div>';

            _element = angular.element(_html);

            expect(function()
            {
                _scope.k = "abc1";

                _compile(_element)(_scope);

                _scope.$digest();
            }).toThrow(new Error('You need to set the "key" attribute to your public reCaptcha key. If you don\'t have a key, please get one from https://www.google.com/recaptcha/admin/create'));
        })
    })

    describe('widgetId', function()
    {
        it('should be null at start', function()
        {
            _scope.k = VALID_KEY;

            var _html = '<div vc-recaptcha key="k"></div>';

            _element = angular.element(_html);

            expect(function()
            {
                _compile(_element)(_scope);
                _scope.$digest();
            }).not.toThrow();

            expect(_element.isolateScope().widgetId).toBeNull();
        })
    })

    describe('form validation', function()
    {
        it('should change the validation to false, widget just created', function()
        {
            var _fakeCreate = function(element, key, cb, options)
            {
                return {
                            then: function(cb)
                            {
                                var _widgetId = 'a';

                                cb(_widgetId);
                            }
                      };
            }

            _scope.onCreate = angular.noop;

            spyOn(_vcRecaptchaService, 'create').and.callFake(_fakeCreate);

            _scope.k = VALID_KEY;

            var _html = '<form name="form">' +
                            '<input type="text" ng-model="something" />' +
                            '<div vc-recaptcha key="k" on-create="onCreate({widgetId: widgetId})" />' +
                        '</form>';

            _element = angular.element(_html);

            _compile(_element)(_scope);

            spyOn(_element.scope(), 'onCreate').and.callThrough();

            var _form = _scope.form;

            _scope.$digest();

            expect(_form.$valid).toBeFalsy(); // widgetCreated

            expect(_vcRecaptchaService.create).toHaveBeenCalled();
            expect(_element.scope().onCreate).toHaveBeenCalledWith({widgetId: 'a'});
        })

        it('should change the validation to true - first timeout flushed', function()
        {
            var _fakeCreate = function(element, key, cb, options)
            {
                cb('response from google');

                return {
                    then: function(cb)
                    {
                        cb();
                    }
                };
            }

            _scope.onCreate = angular.noop;
            _scope.onSuccess = angular.noop;

            spyOn(_vcRecaptchaService, 'create').and.callFake(_fakeCreate);

            _scope.k = VALID_KEY;

            var _html = '<form name="form">' +
                            '<input type="text" ng-model="something" />' +
                            '<div vc-recaptcha key="k" on-create="onCreate()" on-success="onSuccess()"/>' +
                        '</form>';

            _element = angular.element(_html);

            _compile(_element)(_scope);

            var _form = _scope.form;

            _scope.$digest();

            _timeoutMock.flush(TIMEOUT_SESSION_CAPTCHA - 1);

            expect(_form.$valid).toBeTruthy();

            expect(_vcRecaptchaService.create).toHaveBeenCalled();
        })

        it('should change the validation to false - session expired', function()
        {
            var _fakeCreate = function(element, key, cb, options)
            {
                cb('response from google');

                return {
                    then: function(cb)
                    {
                        cb();
                    }
                };
            }

            _scope.onCreate = angular.noop;
            _scope.onSuccess = angular.noop;

            spyOn(_vcRecaptchaService, 'create').and.callFake(_fakeCreate);

            _scope.k = VALID_KEY;

            var _html = '<form name="form">' +
                '<input type="text" ng-model="something" />' +
                '<div vc-recaptcha key="k" on-create="onCreate()" on-success="onSuccess()"/>' +
                '</form>';

            _element = angular.element(_html);

            _compile(_element)(_scope);

            var _form = _scope.form;

            _scope.$digest();

            _timeoutMock.flush(TIMEOUT_SESSION_CAPTCHA + 1);

            expect(_form.$valid).toBeFalsy(); // widgetCreated

            expect(_vcRecaptchaService.create).toHaveBeenCalled();
        })

        it('should call the onSuccess callback with the right params', function()
        {
            var _fakeCreate = function(element, key, cb, options)
            {
                cb('response from google');

                return {
                    then: function(cb)
                    {
                        cb();
                    }
                };
            }

            _scope.onCreate = angular.noop;
            _scope.onSuccess = angular.noop;

            spyOn(_vcRecaptchaService, 'create').and.callFake(_fakeCreate);

            _scope.k = VALID_KEY;

            var _html = '<form name="form">' +
                '<input type="text" ng-model="something" />' +
                '<div vc-recaptcha key="k" on-create="onCreate()" on-success="onSuccess({response: response, widgetId: id})"/>' +
                '</form>';

            _element = angular.element(_html);

            _compile(_element)(_scope);

            var _form = _scope.form;

            spyOn(_element.scope(), 'onSuccess').and.callFake(angular.noop);

            _scope.$digest();

            _timeoutMock.flush(TIMEOUT_SESSION_CAPTCHA - 1);

            expect(_form.$valid).toBeTruthy();

            _timeoutMock.flush(TIMEOUT_SESSION_CAPTCHA + 1);

            expect(_form.$valid).toBeFalsy(); // widgetCreated

            expect(_vcRecaptchaService.create).toHaveBeenCalled();

            expect(_element.scope().onSuccess).toHaveBeenCalledWith({response: 'response from google', widgetId: undefined});
        })
    })
})