"use strict";

describe('service', function()
{
    var _vcRecaptchaService, _windowMock;

    beforeEach(module('vcRecaptcha'));

    beforeEach(inject(function($injector)
    {
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
        it('something')
    })

    describe('reload', function()
    {
        it('something')
    })

    describe('getResponse', function()
    {
        it('something')
    })
})