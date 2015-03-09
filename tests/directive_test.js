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
        it('should change the validation to true', function()
        {
            spyOn(_vcRecaptchaService, 'create').and.callThrough();
            _scope.k = VALID_KEY;

            var _html = '<form name="form">' +
                '<div vc-recaptcha key="k"></div>'+
                '</form>';

            _element = angular.element(_html);

            _compile(_element)(_scope);

            var _form = _scope.form;

            _scope.$digest();

            _timeoutMock.flush();

            expect(_form.$valid).toBeTruthy();

            expect(_vcRecaptchaService.create).toHaveBeenCalled();
        })
    })

    describe('on widget creation', function()
    {
        it('something')
    })
})