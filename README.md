AngularJS reCaptcha
===================

[![Build Status](https://travis-ci.org/VividCortex/angular-recaptcha.svg?branch=master)](https://travis-ci.org/VividCortex/angular-recaptcha)
[![Coverage Status](https://coveralls.io/repos/VividCortex/angular-recaptcha/badge.svg?branch=master)](https://coveralls.io/r/VividCortex/angular-recaptcha?branch=master)
![image](https://img.shields.io/npm/dm/angular-recaptcha.svg)

Add a [reCaptcha](https://www.google.com/recaptcha/intro/index.html) to your [AngularJS](angularjs.org) project.


Demo: http://vividcortex.github.io/angular-recaptcha/


Installation
------------

#### Manual

Download the [latest release](https://github.com/VividCortex/angular-recaptcha/releases/latest).

#### Bower

```
bower install --save angular-recaptcha
```

#### npm

```
npm install --save angular-recaptcha
```


Usage
-----

See [the demo file](demo/usage.html) for a quick usage example.

    IMPORTANT: Keep in mind that the captcha only works when used from a real domain
    and with a valid re-captcha key, so this file won't work if you just load it in
    your browser.

- First, you need to get a valid recaptcha key for your domain. Go to http://www.google.com/recaptcha.

- Include the vc-recaptcha script and make your angular app depend on the `vcRecaptcha` module.

```html
<script type="text/javascript" src="angular-recaptcha.js"></script>
```

```javascript
var app = angular.module('myApp', ['vcRecaptcha']);
```

- After that, you can place a container for the captcha widget in your view, and call the `vc-recaptcha` directive on it like this:

```html
<div
    vc-recaptcha
    key="'---- YOUR PUBLIC KEY GOES HERE ----'"
></div>
```

Here, the `key` attribute is passed to the directive's scope, so you can use either a property in your scope or just a hardcoded string. Be careful to use your public key, not your private one.

Form Validation
---------------
**By default**, if placed in a [form](https://docs.angularjs.org/api/ng/directive/form) using [formControl](https://docs.angularjs.org/api/ng/type/form.FormController) the captcha will need to be checked for the form to be valid.
If the captcha is not checked (if the user has not checked the box or the check has expired) the form will be marked as invalid. The validation key is `recaptcha`.
You can **opt out** of this feature by setting the `required` attribute to `false` or a scoped variable
that will evaluate to `false`. Any other value, or omitting the attribute will opt in to this feature.

Response Validation
-------------------

To validate this object from your server, you need to use the API described in the [verify section](https://developers.google.com/recaptcha/docs/verify). Validation is outside of the scope of this tool, since is mandatory to do that at the server side.

You can simple supply a value for `ng-model` which will be dynamically populated and cleared as the _response_ becomes available and expires, respectfully. When you want the value of the response, you can grab it from the scoped variable that was passed to `ng-model`. It works just like adding `ng-model` to any other input in your form.

```html
...
  <form name="myForm" ng-submit="mySubmit(myFields)">
  ...
  <div
      vc-recaptcha
      ng-model="myFields.myRecaptchaResponse"
  ></div>
  ...
  </form>
...
```

```js
  ...
  $scope.mySubmit = function(myFields){
    console.log(myFields.myRecaptchaResponse);
  }
  ...
```

Or you can programmatically get the _response_ that you need to send to your server, use the method `getResponse()` from the `vcRecaptchaService` angular service. This method receives an optional argument _widgetId_, useful for getting the response of a specific reCaptcha widget (in case you render more than one widget). If no widget ID is provided, the response for the first created widget will be returned.

```js
var response = vcRecaptchaService.getResponse(widgetId); // returns the string response
```

Using `ng-model` is recommended for normal use as the value is tied directly to the reCaptcha instance through the directive and there is no need to manage or pass a _widgetId_.

Other Parameters
----------------

You can optionally pass a __theme__ the captcha should use, as an html attribute:

```html
    <div
        vc-recaptcha
        ng-model="gRecaptchaResponse"
        theme="---- light or dark ----"
        size="---- compact or normal ----"
        type="'---- audio or image ----'"
        key="'---- YOUR PUBLIC KEY GOES HERE ----'"
        lang="---- language code ----"
    ></div>
```

**Language Codes**: https://developers.google.com/recaptcha/docs/language

In this case we are specifying that the captcha should use the theme named _light_.

Listeners
---------

There are three listeners you can use with the directive, `on-create`, `on-success`, and `on-expire`.

* __on-create__: It's called right after the widget is created. It receives a widget ID, which could be helpful if you have more than one reCaptcha in your site.
* __on-success__: It's called once the user resolves the captcha. It receives the response string you would need for verifying the response.
* __on-expire__: It's called when the captcha response expires and the user needs to solve a new captcha.

```html
<div
    vc-recaptcha
    key="'---- YOUR PUBLIC KEY GOES HERE ----'"
    ng-model="gRecaptchaResponse"
    on-create="setWidgetId(widgetId)"
    on-success="setResponse(response)"
    on-expire="cbExpiration()"
    lang=""
></div>
```

### Example

```js
app.controller('myController', ['$scope', 'vcRecaptchaService', function ($scope, recaptcha) {
    $scope.setWidgetId = function (widgetId) {
        // store the `widgetId` for future usage.
        // For example for getting the response with
        // `recaptcha.getResponse(widgetId)`.
    };

    $scope.setResponse = function (response) {
        // send the `response` to your server for verification.
    };

    $scope.cbExpiration = function() {
        // reset the 'response' object that is on scope
    };
}]);
```

Secure Token
------------

If you want to use a secure token pass it along with the site key as an html attribute.

```html
<div
    vc-recaptcha
    key="'---- YOUR PUBLIC KEY GOES HERE ----'"
    stoken="'--- YOUR GENERATED SECURE TOKEN ---'"
></div>
```

Please note that you have to encrypt your token yourself with your private key upfront!
To learn more about secure tokens and how to generate & encrypt them please refer to the [reCAPTCHA Docs](https://developers.google.com/recaptcha/docs/secure_token).

Service Provider
----------------
You can use the vcRecaptchaServiceProvider to configure the recaptcha service once in your application's config function.
This is a convenient way to set your reCaptcha site key, theme, stoken, size, and type in one place instead of each vc-recaptcha directive element instance.
The defaults defined in the service provider will be overrode by any values passed to the vc-recaptcha directive element for that instance.

```javascript
myApp.config(function(vcRecaptchaServiceProvider){
  vcRecaptchaServiceProvider.setSiteKey('---- YOUR PUBLIC KEY GOES HERE ----')
  vcRecaptchaServiceProvider.setTheme('---- light or dark ----')
  vcRecaptchaServiceProvider.setStoken('--- YOUR GENERATED SECURE TOKEN ---')
  vcRecaptchaServiceProvider.setSize('---- compact or normal ----')
  vcRecaptchaServiceProvider.setType('---- audio or image ----')
  vcRecaptchaServiceProvider.setLang('---- language code ----')
});
```

**Language Codes**: https://developers.google.com/recaptcha/docs/language

You can also set all of the values at once.

```javascript
myApp.config(function(vcRecaptchaServiceProvider){
  vcRecaptchaServiceProvider.setDefaults({
    key: '---- YOUR PUBLIC KEY GOES HERE ----',
    theme: '---- light or dark ----',
    stoken: '--- YOUR GENERATED SECURE TOKEN ---',
    size: '---- compact or normal ----',
    type: '---- audio or image ----',
    lang: '---- language code ----'
  });
});
```
Note: any value omitted will be undefined, even if previously set.

Differences with the old reCaptcha
----------------------------------

- If you want to force a language, you'll need to add a `hl` parameter to the script of the reCaptcha API (`?onload=onloadCallback&render=explicit&hl=es`).
- Parameter _tabindex_ is no longer used by reCaptcha and its usage has no effect.
- Access to the input text is no longer supported.
- _Challenge_ is no longer provided by reCaptcha. The response text is used along with the private key and user's IP address for verification.
- Switching between image and audio is now handled by reCaptcha.
- Help display is now handled by reCaptcha.


Recent Changelog
----------------

- 3.0.0 - Removed the need to include the Google recaptcha api.
- 2.2.3 - Removed _cleanup_ after creating the captcha element.
- 2.0.1 - Fixed onload when using ng-route and recaptcha is placed in a secondary view.
- 2.0.0 - Rewritten service to support new reCaptcha
- 1.0.2 - added extra `Recaptcha` object methods to the service, i.e. `switch_type`, `showhelp`, etc.
- 1.0.0 - the `key` attribute is now a scope property of the directive
- Added the `destroy()` method to the service. Thanks to @endorama.
- We added a different integration method (see demo/2.html) which is safer because it doesn't relies on a timeout on the reload event of the recaptcha. Thanks to [@sboisse](https://github.com/sboisse) for reporting the issue and suggesting the solution.
- The release is now built using [GruntJS](http://gruntjs.com/) so if you were using the source files (the `src` directory) in your projects you should now use the files in the release directory.
