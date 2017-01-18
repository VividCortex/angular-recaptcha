function ProviderDriver() {
    var _this = this;
    var mockModules = {
        $window: {}
    };

    module(mockModules); // mock all the properties

    this.given = {
        recaptchaLoaded: function (recaptchaMock) {
            mockModules.$window.grecaptcha = recaptchaMock;
            return _this;
        }
    };

    this.when = {
        created: function () {
            module(function (vcRecaptchaServiceProvider) {
                _this.provider = vcRecaptchaServiceProvider;
            });

            inject(); // needed for angular-mocks to kick off

            return _this;
        },
        callingCreate: function () {
            inject(function (vcRecaptchaService, $rootScope) {
                vcRecaptchaService.create(null, {});
                $rootScope.$digest();
            });

            return this;
        }
    };
}