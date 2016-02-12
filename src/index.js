'use strict';

var _ = require('lodash');
var bluebird = require('bluebird');
var url = require('url');
var GitHubApi = require('github');
var through = require('through2');
var parseGithubUrl = require('@bahmutov/parse-github-repo-url');
var commitParser = require('./commit-parser');

module.exports = githubNotifier;

function githubNotifier(pluginConfig, config, callback) {
  var githubConfig = config.options.githubUrl ? url.parse(config.options.githubUrl) : {};

  var github = new GitHubApi({
    version: '3.0.0',
    port: githubConfig.port,
    protocol: (githubConfig.protocol || '').split(':')[0] || null,
    host: githubConfig.hostname,
  });

  github.authenticate({
    type: 'oauth',
    token: config.options.githubToken,
  });

  // Placed at the end so that all GitHub code has had a chance to be invoked, including sanity
  // checking for required input, like a GitHub token.
  if (config.options.debug) {
    return callback(null);
  }

  var createComment = bluebird.promisify(github.issues.createComment);
  var parsedGithubUrl = parseGithubUrl(config.pkg.repository.url);
  commitParser(config.commits)
    .pipe(through.obj(function (commit, enc, cb) {
      var commentPromises = _.map(commit.references, function (reference) {
        var msg = {
          user: parsedGithubUrl[0],
          repo: parsedGithubUrl[1],
          number: reference.issue,
          message: 'Version ' + config.pkg.version + ' has been published.',
        };

        return createComment(msg);
      });

      bluebird.all(commentPromises)
        .then(function () {
          cb(null, commit);
        })
        .catch(function (err) {
          cb(err);
        });
    }))
    .on('error', function () {
      callback(false);
    })
    .on('finish', function () {
      callback(true);
    });
}
