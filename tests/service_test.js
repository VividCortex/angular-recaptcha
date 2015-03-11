"use strict";

describe('service', function()
{
    var _rootScope, _vcRecaptchaService, _windowMock;

    beforeEach(module('vcRecaptcha', function($provide)
    {
        $provide.constant('$window',
        {
            grecaptcha:
            {
                render: angular.noop,
                getResponse: angular.noop,
                reset: angular.noop
            }
        });
    }));

    beforeEach(inject(function($injector)
    {
        _rootScope = $injector.get('$rootScope');

        _vcRecaptchaService = $injector.get('vcRecaptchaService');
        _windowMock = $injector.get('$window');

        spyOn(_windowMock, 'vcRecaptchaApiLoaded').and.callThrough();
    }));

    describe('init', function()
    {
        it('should have vcRecaptchaApiLoaded available globally', function()
        {
            expect(_windowMock.vcRecaptchaApiLoaded).toBeDefined();
            expect(typeof _windowMock.vcRecaptchaApiLoaded).toEqual('function');
        })
    })

    describe('create', function()
    {
        it('should call recaptcha.render', function()
        {
            spyOn(_windowMock.grecaptcha, 'render').and.callThrough();

            _windowMock.vcRecaptchaApiLoaded();

            var _element = '<div></div>';
            var _key = 'abc123456';
            var _fn = angular.noop;
            var _conf = {};

            var _confRender = {sitekey: _key, callback: _fn}

            _vcRecaptchaService.create(_element, _key, _fn, _conf);

            _rootScope.$digest();

            expect(_windowMock.grecaptcha.render).toHaveBeenCalledWith(_element, _confRender);
        })
    })

    describe('reload', function()
    {
        it('should call reset', function()
        {
            var _widgetId = 123;

            spyOn(_windowMock.grecaptcha, 'reset').and.callThrough();

            _vcRecaptchaService.reload(_widgetId);

            expect(_windowMock.grecaptcha.reset).toHaveBeenCalledWith(_widgetId);
        })
    })

    describe('getResponse', function()
    {
        it('should call getResponse', function()
        {
            var _widgetId = 123;

            spyOn(_windowMock.grecaptcha, 'getResponse').and.callThrough();

            _vcRecaptchaService.getResponse(_widgetId);

            expect(_windowMock.grecaptcha.getResponse).toHaveBeenCalledWith(_widgetId);
        })

    })
})