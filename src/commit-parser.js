'use strict';

var parser = require('conventional-commits-parser');
var streamify = require('stream-array');
var through = require('through2');

module.exports = commitParser;

function commitParser(commits) {
  return streamify(commits)
    .pipe(through.obj(function (commit, enc, cb) {
      cb(null, commit.message);
    }))
    .pipe(parser())
  ;
}
