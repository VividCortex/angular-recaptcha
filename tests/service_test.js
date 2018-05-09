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

    // Regresion test for https://git.io/vp2SO
    describe('without loaded api, loaded grecaptcha from cache without render func', () => {
        const grecaptchaMock = {};
        const _key = '1234567890123456789012345678901234567890';

        beforeEach(function () {
            const doc = [{
                querySelector: () => ({}),
            }];

            driver
                .given.apiLoaded(grecaptchaMock)
                .given.mockDocument(doc)
                .when.created();
        });

        it('should not try to render recaptcha', () => {
            const spy = jasmine.createSpy('recaptchaCreate');

            driver.service.create('<div></div>', {
                key: _key,
                callback: spy
            });

            expect(() => driver.applyChanges()).not.toThrow();
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('without loaded api, with script tag', function () {
        var createElement,
            appendSpy,
            funcName,
            grecaptchaMock;

        beforeEach(function () {
            createElement = jasmine.createSpy('createElement');
            appendSpy = jasmine.createSpy('appendSpy');

            var doc = [{
                createElement: createElement,
                querySelector: function() {
                    return {};
                }
            }];
            doc.find = function () {
                return [{
                    appendChild: appendSpy
                }];
            };

            driver
                .given.onLoadFunctionName(funcName = 'my-func')
                .given.mockDocument(doc)
                .when.created();
        });

        it('should not add script tag to body', function () {
            expect(createElement).not.toHaveBeenCalled();
        });

        it('should validate that recaptcha is not loaded', function () {
            expect(driver.service.reload).toThrowError('reCaptcha has not been loaded yet.');
        });

        it('should validate that recaptcha is loaded after script is loaded', function () {
            driver
                .given.apiLoaded(grecaptchaMock = jasmine.createSpyObj('grecaptcha', ['render', 'getResponse', 'reset','execute']));

            driver.$interval.flush(25);

            var _widgetId = 123;

            driver.service.execute(_widgetId);

            expect(grecaptchaMock.execute).toHaveBeenCalledWith(_widgetId);
        });

        it('should not proceed if render function not available in grecaptcha', function () {
            driver.given.apiLoaded(grecaptchaMock = jasmine.createSpyObj('grecaptcha', ['reset']));
            driver.$interval.flush(25);

            expect(() => driver.service.execute(123)).toThrowError('reCaptcha has not been loaded yet.');
        });
    });

    describe('without loaded api', function () {
        var scriptTagSpy,
            appendSpy,
            funcName;

        beforeEach(function () {
            scriptTagSpy = jasmine.createSpy('scriptTagSpy');
            appendSpy = jasmine.createSpy('appendSpy');

            var doc = [{
                createElement: function () {
                    return scriptTagSpy;
                },
                querySelector: function() {
                    return null;
                }
            }];
            doc.find = function () {
                return [{
                    appendChild: appendSpy
                }];
            };

            driver
                .given.onLoadFunctionName(funcName = 'my-func')
                .given.mockDocument(doc)
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
