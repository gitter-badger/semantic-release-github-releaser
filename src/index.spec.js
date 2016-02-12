'use strict';

var chai = require('chai');
var nock = require('nock');
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

chai.use(sinonChai);
var expect = chai.expect;

function githubMock() {
}

githubMock.prototype.authenticate = sinon.spy();
githubMock.prototype.issues = {
  createComment: sinon.stub(),
};

describe('semantic-release-github-notifier', function () {
  var options;
  var plugin;

  before(function () {
    nock.disableNetConnect();

    plugin = proxyquire('./index', { github: githubMock });
  });

  beforeEach(function () {
    options = {
      debug: true,
      githubToken: 'TOKEN',
      githubUrl: 'https://www.github.com:80',
    };

    githubMock.prototype.authenticate.reset();
    githubMock.prototype.issues.createComment.reset();
  });

  describe('debug mode', function () {

    it('parses GitHub URL', function () {
      var callback = sinon.spy();

      plugin({}, { options: options }, callback);

      expect(githubMock.prototype.authenticate).to.have.been.calledOnce
        .and.to.have.been.calledWithExactly({ type: 'oauth', token: options.githubToken });

      expect(callback).to.have.been.calledOnce
        .and.to.have.been.calledWithExactly(null);
    });

    it('falls back on default GitHub URL', function () {
      var callback = sinon.spy();
      options.githubUrl = undefined;

      plugin({}, { options: options }, callback);

      expect(githubMock.prototype.authenticate).to.have.been.calledOnce
        .and.to.have.been.calledWithExactly({ type: 'oauth', token: options.githubToken });

      expect(callback).to.have.been.calledOnce
        .and.to.have.been.calledWithExactly(null);
    });
  });

  describe('normal mode', function () {

    function pluginWrapper(callback) {
      plugin({}, {
        commits: [
          {
            message: 'feat(something): Added new feature.\nFixes #1.',
          },
        ],
        options: options,
        pkg: {
          repository: {
            url: 'https://github.com/hbetts/semantic-release-github-notifier.git',
          },
          version: '1.0.0',
        },
      }, callback);
    }

    beforeEach(function () {
      options.debug = undefined;
    });

    it('calls callback with true on successful GitHub comment', function (done) {
      githubMock.prototype.issues.createComment.onFirstCall().callsArgWith(1, null, {});

      pluginWrapper(pluginCallback);

      function pluginCallback(result) {
        expect(githubMock.prototype.issues.createComment).to.have.been.calledOnce
          .and.to.have.been.calledWith({
            user: 'hbetts',
            repo: 'semantic-release-github-notifier',
            number: '1',
            message: 'Version 1.0.0 has been published.',
          });
        expect(result).to.equal(true);

        done();
      }
    });

    it('calls callback with false on failed GitHub comment', function (done) {
      githubMock.prototype.issues.createComment.onFirstCall().callsArgWith(1, new Error('Failed'), {});

      pluginWrapper(pluginCallback);

      function pluginCallback(result) {
        expect(githubMock.prototype.issues.createComment).to.have.been.calledOnce;
        expect(result).to.equal(false);

        done();
      }
    });
  });
});
