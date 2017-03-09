describe('provider', function () {
    'use strict';

    var driver,
        recaptchaMock,
        key;

    beforeEach(module('vcRecaptcha'));

    beforeEach(function () {
        driver = new ProviderDriver();
        driver.given.recaptchaLoaded(recaptchaMock = jasmine.createSpyObj('recaptchaMock', ['render']))
            .when.created();

        driver.provider.setSiteKey(key = '1234567890123456789012345678901234567890');
    });

    it('should setDefaults', function () {
        var modifiedKey = key.substring(0, 39) + 'x';

        driver.provider.setDefaults({key: modifiedKey});

        driver.when.callingCreate();

        var callArgs = recaptchaMock.render.calls.mostRecent().args[1];

        expect(callArgs).toEqual(jasmine.objectContaining({sitekey: modifiedKey}));
    });

    it('should setSiteKey', function () {
        driver.provider.setSiteKey(key);

        driver.when.callingCreate();

        var callArgs = recaptchaMock.render.calls.mostRecent().args[1];

        expect(callArgs).toEqual(jasmine.objectContaining({sitekey: key}));
    });

    it('should setTheme', function () {
        var theme = 'theme';
        driver.provider.setTheme(theme);

        driver.when.callingCreate();

        var callArgs = recaptchaMock.render.calls.mostRecent().args[1];

        expect(callArgs).toEqual(jasmine.objectContaining({theme: theme}));
    });

    it('should setStoken', function () {
        var stoken = 'stoken';
        driver.provider.setStoken(stoken);

        driver.when.callingCreate();

        var callArgs = recaptchaMock.render.calls.mostRecent().args[1];

        expect(callArgs).toEqual(jasmine.objectContaining({stoken: stoken}));
    });

    it('should setSize', function () {
        var size = 'size';
        driver.provider.setSize(size);

        driver.when.callingCreate();

        var callArgs = recaptchaMock.render.calls.mostRecent().args[1];

        expect(callArgs).toEqual(jasmine.objectContaining({size: size}));
    });

    it('should setType', function () {
        var type = 'type';
        driver.provider.setType(type);

        driver.when.callingCreate();

        var callArgs = recaptchaMock.render.calls.mostRecent().args[1];

        expect(callArgs).toEqual(jasmine.objectContaining({type: type}));
    });

    it('should setLang', function () {
        var lang = 'en';
        driver.provider.setLang(lang);

        driver.when.callingCreate();

        var callArgs = recaptchaMock.render.calls.mostRecent().args[1];

        expect(callArgs).toEqual(jasmine.objectContaining({hl: lang}));
    });

    it('should setBadge', function () {
        var badge = 'bottomright';
        driver.provider.setBadge(badge);

        driver.when.callingCreate();

        var callArgs = recaptchaMock.render.calls.mostRecent().args[1];

        expect(callArgs).toEqual(jasmine.objectContaining({badge: badge}));
    });    
    
});
