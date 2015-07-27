AngularJS reCaptcha
===================

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

- Include the reCaptcha [API](https://developers.google.com/recaptcha/docs/display#AJAX) using this script in your HTML:

```html
<script
  src="https://www.google.com/recaptcha/api.js?onload=vcRecaptchaApiLoaded&render=explicit"
  async defer
></script>
```
    As you can see, we are specifying a `onload` callback, which will notify the
    angular service once the api is ready for usage.
    
- Also include the vc-recaptcha script and make your angular app depend on the `vcRecaptcha` module.

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

Response Validation
-------------------

To validate this object from your server, you need to use the API described in the [verify section](https://developers.google.com/recaptcha/docs/verify). Validation is outside of the scope of this tool, since is mandatory to do that at the server side.

To get the _response_ that you need to send to your server, use the method `getResponse()` from the `vcRecaptchaService` angular service. This method receives an optional argument _widgetId_, useful for getting the response of a specific reCaptcha widget (in case you render more than one widget). If no widget ID is provided, the response for the first created widget will be returned.

```js
var response = vcRecaptchaService.getResponse(); // returns the string response
```

Other Parameters
----------------

You can optionally pass a __theme__ the captcha should use, as an html attribute:

```html
    <div
        vc-recaptcha
        theme="light"
        key="'---- YOUR PUBLIC KEY GOES HERE ----'"
    ></div>
```

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
    on-create="setWidgetId(widgetId)"
    on-success="setResponse(response)"
    on-expire="cbExpiration()"
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

- 2.2.3 - Removed _cleanup_ after creating the captcha element.
- 2.0.1 - Fixed onload when using ng-route and recaptcha is placed in a secondary view.
- 2.0.0 - Rewritten service to support new reCaptcha
- 1.0.2 - added extra `Recaptcha` object methods to the service, i.e. `switch_type`, `showhelp`, etc.
- 1.0.0 - the `key` attribute is now a scope property of the directive
- Added the ```destroy()``` method to the service. Thanks to @endorama.
- We added a different integration method (see demo/2.html) which is safer because it doesn't relies on a timeout on the reload event of the recaptcha. Thanks to [@sboisse](https://github.com/sboisse) for reporting the issue and suggesting the solution.
- The release is now built using [GruntJS](http://gruntjs.com/) so if you were using the source files (the ```src``` directory) in your projects you should now use the files in the release directory.
