describe('service', function () {
    'use strict';

    var driver;

    beforeEach(module('vcRecaptcha'));

    beforeEach(function () {
        driver = new ServiceDriver();
    });

    describe('with loaded api', function () {
        var grecaptchaMock;

        beforeEach(function () {
            driver
                .given.apiLoaded(grecaptchaMock = jasmine.createSpyObj('grecaptcha', ['render', 'getResponse', 'reset','execute']))
                .when.created();
        });

        it('should call recaptcha.render', function () {
            var _element = '<div></div>',
                _key = '1234567890123456789012345678901234567890',
                _fn = angular.noop,
                _confRender = {
                    sitekey: _key,
                    key: _key,
                    callback: _fn,
                    theme: undefined,
                    stoken: undefined,
                    size: undefined,
                    type: undefined,
                    hl: undefined,
                    badge: undefined
                };

            driver.when.notifyThatApiLoaded();

            driver.service.create(_element, {
                key: _confRender.key,
                callback: _fn
            });

            driver.applyChanges();

            expect(grecaptchaMock.render).toHaveBeenCalledWith(_element, _confRender);
        });

        it('should call reset', function () {
            var _widgetId = 123;

            driver.service.reload(_widgetId);

            expect(grecaptchaMock.reset).toHaveBeenCalledWith(_widgetId);
        });

        it('should call execute', function () {
            var _widgetId = 123;

            driver.service.execute(_widgetId);

            expect(grecaptchaMock.execute).toHaveBeenCalledWith(_widgetId);
        });

        it('should call getResponse', function () {
            var _widgetId = 123;

            driver.service.getResponse(_widgetId);

            expect(grecaptchaMock.getResponse).toHaveBeenCalledWith(_widgetId);
        });

        it('should call useLang', function () {
            var _element = angular.element('<div><iframe src="http://localhost?hl=fr"></iframe></div>')[0],
                _key = '1234567890123456789012345678901234567890';

            driver.when.notifyThatApiLoaded();

            driver.service.create(_element, {
                key: _key
            }).then(function (widgetId) {
                var instance = driver.service.getInstance(widgetId);
                expect(instance).toEqual(_element);

                driver.service.useLang(widgetId, 'es');
                expect(driver.service.useLang(widgetId)).toEqual('es');
            });

            driver.applyChanges();
        });
    });

    describe('without loaded api', function () {
        var scriptTagSpy,
            appendSpy,
            funcName;

        beforeEach(function () {
            scriptTagSpy = jasmine.createSpy('scriptTagSpy');
            appendSpy = jasmine.createSpy('appendSpy');

            driver
                .given.onLoadFunctionName(funcName = 'my-func')
                .given.mockDocument({
                    find: function () {
                        return {
                            append: appendSpy
                        };
                    }
                })
                .given.mockWindow({
                    document: {
                        createElement: function () {
                            return scriptTagSpy;
                        }
                    }
                })
                .when.created();

        });

        it('should add script tag to body', function () {
            expect(scriptTagSpy.async).toBe(true);
            expect(scriptTagSpy.defer).toBe(true);
            expect(appendSpy).toHaveBeenCalledWith(scriptTagSpy);
        });

        it('should add callback function name to src', function () {
            expect(scriptTagSpy.src).toBe('https://www.google.com/recaptcha/api.js?onload=' + funcName + '&render=explicit');
        });

        it('should validate that recaptcha is loaded', function () {
            expect(driver.service.reload).toThrowError('reCaptcha has not been loaded yet.');
        });
    });
});
