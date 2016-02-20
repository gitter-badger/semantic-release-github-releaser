'use strict';

var chai = require('chai');
var nock = require('nock');
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

chai.use(sinonChai);
var expect = chai.expect;

describe('semantic-release-github-notifier', function () {
  var options;
  var plugin;
  var conventionalGithubReleaserMock = sinon.stub();

  before(function () {
    nock.disableNetConnect();

    plugin = proxyquire('./index', {
      'conventional-github-releaser': conventionalGithubReleaserMock,
    });
  });

  beforeEach(function () {
    options = {
      debug: true,
      githubToken: 'TOKEN',
      githubUrl: 'https://www.github.com:80',
    };

    conventionalGithubReleaserMock.reset();
  });

  it('does not release in debug mode', function () {
    var callback = sinon.spy();

    plugin({}, { options: options }, callback);

    expect(conventionalGithubReleaserMock).to.not.have.been.called;

    expect(callback).to.have.been.calledOnce
      .and.to.have.been.calledWithExactly(null);
  });

  describe('normal mode', function () {

    it('conventional-github-releaser called with default preset', function (done) {
      options.debug = undefined;
      conventionalGithubReleaserMock.yields(null, []);

      plugin({}, { options: options }, pluginCallback);

      function pluginCallback(result) {
        expect(conventionalGithubReleaserMock).to.have.been.calledOnce;
        expect(result).to.equal(true);
        done();
      }
    });
  });
});
