'use strict';

var conventionalGithubReleaser = require('conventional-github-releaser');

module.exports = githubReleaser;

function githubReleaser(pluginConfig, config, callback) {
  var auth = {
    type: 'oauth',
    token: config.options.githubToken,
  };

  // Placed at the end so that all GitHub code has had a chance to be invoked, including sanity
  // checking for required input, like a GitHub token.
  if (config.options.debug) {
    return callback(null);
  }

  conventionalGithubReleaser(auth, {
    preset: config.preset || 'angular',
  }, function (err/*, responses*/) {
    console.log('err', err);
    if (err) {
      callback(false);
    }

    callback(true);
  });
}
