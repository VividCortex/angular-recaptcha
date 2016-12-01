describe('service', function () {
    'use strict';

    var vcRecaptchaService, $window;

    beforeEach(module('vcRecaptcha', function ($provide) {
        $provide.constant('$window', {
            grecaptcha: jasmine.createSpyObj('grecaptcha', ['render', 'getResponse', 'reset'])
        });
    }));

    beforeEach(inject(function (_vcRecaptchaService_, _$window_) {
        vcRecaptchaService = _vcRecaptchaService_;
        $window            = _$window_;

        $window.vcRecaptchaApiLoaded = jasmine.createSpy('vcRecaptchaApiLoaded');
    }));

    describe('create', function () {
        it('should call recaptcha.render', inject(function ($rootScope) {
            var _element    = '<div></div>',
                _key        = '1234567890123456789012345678901234567890',
                _fn         = angular.noop,
                _confRender = {
                    sitekey: _key,
                    key: _key,
                    callback: _fn,
                    theme: undefined,
                    stoken: undefined,
                    size: undefined,
                    type: undefined,
                    hl: undefined
                };

            $window.vcRecaptchaApiLoaded();

            vcRecaptchaService.create(_element, {
                key: _confRender.key,
                callback: _fn
            });

            $rootScope.$digest();

            expect($window.grecaptcha.render).toHaveBeenCalledWith(_element, _confRender);
        }));
    });

    describe('reload', function () {
        it('should call reset', function () {
            var _widgetId = 123;

            vcRecaptchaService.reload(_widgetId);

            expect($window.grecaptcha.reset).toHaveBeenCalledWith(_widgetId);
        });
    });

    describe('getResponse', function () {
        it('should call getResponse', function () {
            var _widgetId = 123;

            vcRecaptchaService.getResponse(_widgetId);

            expect($window.grecaptcha.getResponse).toHaveBeenCalledWith(_widgetId);
        });
    });

    describe('useLang', function () {
        it('should call useLang', inject(function ($rootScope) {
            var _element  = angular.element('<div><iframe src="http://localhost?hl=fr"></iframe></div>')[0],
                _key      = '1234567890123456789012345678901234567890';

            $window.vcRecaptchaApiLoaded();

            vcRecaptchaService.create(_element, {
                key: _key
            }).then(function (widgetId) {
                var instance = vcRecaptchaService.getInstance(widgetId);
                expect(instance).toEqual(_element);

                vcRecaptchaService.useLang(widgetId, 'es');
                expect(vcRecaptchaService.useLang(widgetId)).toEqual('es');
            })

            $rootScope.$digest();
        }));
    });
});
