VividCortex reCaptcha AngularJS Directive
=========================================

Use this directive to be able to submit with XHR a form that contains a reCaptcha.


Demo
====

See demo/test.html for an usage example. Keep in mind that the captcha only works when used from a real domain and with a valid re-captcha key, so this file wont work if you just load it in your browser.


Usage
=====

You need first to get a valid public key for your domain. See http://www.google.com/recaptcha.

Then, in your view, you need to place a container for the captcha:

```html
    <div
        vc-recaptcha
        ng-model="model.captcha"
        key="---- YOUR PUBLIC KEY GOES HERE ----"
    ></div>
```

In this case we are mapping the captcha data to the scope property ```model.captcha```. If you inspect the value of this roperty you'll see something like:

```json
{
    "response": "foo bar",
    "challenge": "03AHJ_VuvQ5p0AdejIw4W6yUKA65eRIEFiXFTxtKYD22UH9zjavXK4IYRZ8fhaGHjKXLKZa2MA-Lqeui5V9aeRWWTZSN6e1tED4gt7O77ROTcyY0Uedkc7LHzSUbLNULMcbXb2JThqLgOMvHINaoOtoniW4CepuOLG2h8s0tRUfqaQt6iUqNeWWHQ"
}
```

This object contains the two values needed to validate the captcha in your server. ```response``` is the response of the user, and ```challenge``` is the identification of the captcha that your user resolved.

To validate this object from your server, you need to use one of the [server side plugins](https://developers.google.com/recaptcha/) or [roll your own](https://developers.google.com/recaptcha/docs/verify).


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
        key="---- YOUR PUBLIC KEY GOES HERE ----"
    ></div>
```

In this case we are specifying that the captcha should use the theme named 'clean', display the texts in english language and the captcha input should have tabindex 3.
