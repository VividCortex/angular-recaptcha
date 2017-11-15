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
            mockModules.$document = mockDocument;
            mockModules.$window.document = mockDocument[0];

            return _this;
        }
    };

    this.when = {
        created: function () {
            inject(function (vcRecaptchaService, _$interval_) {
                _this.service = vcRecaptchaService;
                _this.$interval = _$interval_;
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