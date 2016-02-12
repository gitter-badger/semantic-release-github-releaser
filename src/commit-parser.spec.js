'use strict';

var chai = require('chai');
var expect = chai.expect;
var through = require('through2');

var commitParser = require('./commit-parser');

describe('commit-parser', function () {

  it('does something', function (done) {
    var stream = commitParser([{ message: 'feat(something): Added new feature.\nFixes #1.' }]);

    stream
      .pipe(through.obj(function (commit, enc, cb) {
        expect(commit.type).to.equal('feat');
        expect(commit.references.length).to.equal(1);

        //expect(commit.references[0].issue).to.equal(1);

        cb(null, commit);
      }))
      .on('finish', function () {
        done();
      });
  });
});
