// Package metadata file for Meteor.js
var packageName = 'aaronroberson:angular-recaptcha';
var where = 'client';
var version = '2.2.5';
var summary = 'Angular directive that allows you to use a reCaptcha widget inside an angular form';
var gitLink = 'https://github.com/aaronroberson/angular-recaptcha';
var documentationFile = 'README.md';

// Meta-data
Package.describe({
  name: packageName,
  version: version,
  summary: summary,
  git: gitLink,
  documentation: documentationFile
});

Package.onUse(function(api) {
  api.versionsFrom(['METEOR@0.9.0', 'METEOR@1.0']);

  api.use('angular:angular@1.2.0', where);

  api.addFiles('release/angular-recaptcha.js', where);
});  