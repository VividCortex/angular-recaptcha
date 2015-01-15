/*global angular, Recaptcha */
(function (ng) {
    'use strict';

    var app = ng.module('vcRecaptcha');

    /**
     * An angular factory to append the Google recaptcha script to the page
     * that is using the module and return a promise to it.
     */
    app.factory('vcRecaptchaFactory', ['$q', '$window', '$rootScope', '$document', function($q, $window, $rootScope, $document) {
        var d = $q.defer();

        // Because Google ReCaptcha loads more scripts, we still need
        // an onload function so we know when the internal scripts are
        // loaded.
        $window.onScriptLoad = function() {
            // Load client in the browser
            $rootScope.$apply(function() {
                d.resolve($window.grecaptcha);
            });
        }

        // Create a script tag with ReCaptcha as the source
        // and call our onScriptLoad callback when it
        // has been loaded
        var scriptTag = $document[0].createElement('script');
        scriptTag.type = 'text/javascript'; 
        scriptTag.async = true;
        scriptTag.src = 'https://www.google.com/recaptcha/api.js?onload=onScriptLoad&render=explicit';

        var s = $document[0].getElementsByTagName('body')[0];
        s.appendChild(scriptTag);
   
        return {
            grecaptcha: function() { return d.promise; }
        };
    }]);
}(angular));