VividCortex reCaptcha AngularJS Directive
=========================================

Use this directive to be able to submit with XHR a form that contains a reCaptcha.


Demo
====

See [the demo file](demo/usage.html) for an usage example.

Keep in mind that the captcha only works when used from a real domain and with a valid re-captcha key, so this file wont work if you just load it in your browser.


Usage
=====

First, you need to get a valid public key for your domain. See http://www.google.com/recaptcha.

Then, include the reCaptcha [AJAX API](https://developers.google.com/recaptcha/docs/display#AJAX) using this script in your HTML:

```html
<script type="text/javascript" src="//www.google.com/recaptcha/api/js/recaptcha_ajax.js"></script>
```

Also include the vc-recaptcha script and make your angular app depend on the `vcRecaptcha` module.

```html
<script type="text/javascript" src="angular-recaptcha.js"></script>
```

```javascript
var app = angular.module('myApp', ['vcRecaptcha']);
```


After that, you can place a container for the captcha widget in your view, and call the `vc-recaptcha` directive on it like this:

```html
<div
    vc-recaptcha
    key="'---- YOUR PUBLIC KEY GOES HERE ----'"
></div>
```

Here the `key` attribute is passed to the directive's scope, so you can use either a property in your scope or just a hardcoded string. Be careful to use your public key, not your private one.

To validate this object from your server, you need to use one of the [server side plugins](https://developers.google.com/recaptcha/) or [roll your own](https://developers.google.com/recaptcha/docs/verify). Validations is outside of the scope of this tool, since is mandatory to do that at the server side.
To get the values that you need to send to your server, use the `vcRecaptchaService` angular service. This object contains a `data()` method that returns two values needed to validate the captcha in your server. ```response``` is the response of the user, and ```challenge``` is the identification of the captcha that your user resolved.

```json
{
    "response": "foo bar",
    "challenge": "03AHJ_VuvQ5p0AdejIw4W6yUKA65eRIEFiXFTxtKYD22UH9zjavXK4IYRZ8fhaGHjKXLKZa2MA-Lqeui5V9aeRWWTZSN6e1tED4gt7O77ROTcyY0Uedkc7LHzSUbLNULMcbXb2JThqLgOMvHINaoOtoniW4CepuOLG2h8s0tRUfqaQt6iUqNeWWHQ"
}
```

Other Parameters
================

You can optionally pass other parameters to the captcha, as html attributes:

```html
    <div
        vc-recaptcha
        ng-model="model.captcha"
        tabindex="3"
        theme="clean"
        lang="en"
        key="'---- YOUR PUBLIC KEY GOES HERE ----'"
    ></div>
```

In this case we are specifying that the captcha should use the theme named 'clean', display the texts in english language and the captcha input should have tabindex 3.


Recent Changelog
================

- 1.0.2 - added extra `Recaptcha` object methods to the service, i.e. `switch_type`, `showhelp`, etc.
- 1.0.0 - the `key` attribute is now a scope property of the directive
- Added the ```destroy()``` method to the service. Thanks to @endorama.
- We added a different integration method (see demo/2.html) which is safer because it doesn't relies on a timeout on the reload event of the recaptcha. Thanks to [@sboisse](https://github.com/sboisse) for reporting the issue and suggesting the solution.
- The release is now built using [GruntJS](gruntjs.com) so if you were using the source files (the ```src``` directory) in your projects you should now use the files in the release directory.
