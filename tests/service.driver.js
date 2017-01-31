function ServiceDriver() {
    var _this = this;
    var mockModules = {
        $window: {},
        $document: {}
    };

    module(mockModules); // mock all the properties

    this.given = {
        apiLoaded: function (mockRecaptcha) {
            mockModules.$window.grecaptcha = mockRecaptcha;

            return _this;
        },
        onLoadFunctionName: function (funcName) {
            module(function (vcRecaptchaServiceProvider) {
                vcRecaptchaServiceProvider.setOnLoadFunctionName(funcName);
            });
            return _this;
        },
        mockDocument: function (mockDocument) {
            mockModules.$document.find = mockDocument.find;

            return _this;
        },
        mockWindow: function (mockWindow) {
            mockModules.$window.document = mockWindow.document;

            return _this;
        }
    };

    this.when = {
        created: function () {
            inject(function (vcRecaptchaService) {
                _this.service = vcRecaptchaService;
            })
        },
        notifyThatApiLoaded: function () {
            mockModules.$window.vcRecaptchaApiLoaded();
            return _this;
        }
    };
}

ServiceDriver.prototype.applyChanges = function () {
    inject(function ($rootScope) {
        $rootScope.$digest();
    });
};