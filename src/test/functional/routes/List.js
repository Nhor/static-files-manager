const path = require('path');
const expect = require('chai').expect;
const request = require('request');
const Config = require('../../../Config');
const Error = require('../../../utils/Error');
const Database = require('../../../utils/Database');
const File = require('../../../utils/File');
const User = require('../../../models/User');
const Session = require('../../../models/Session');

describe('List', () => {

  describe('GET', () => {

    let database;
    let userId;
    let sessionId;
    let invalidSessionId;
    let fileName;
    let directoryName;

    before('set up global properties and create test user, session and copy fixture file', () => {
      database = new Database(Config.database);
      let username = 'username';
      let password = 'password123';
      invalidSessionId = 'invalidSessionId';
      fileName = 'file.txt';
      directoryName = 'path';
      return User
        .create(database, username, password)
        .then(() => User.getByUsername(database, username))
        .then(user => {
          userId = user.id;
          return Session.create(database, Config.session, userId)
        })
        .then(() => Session.getByUserId(database, userId))
        .then(session => {
          sessionId = session.id;
          return File.createDirectory(directoryName);
        })
        .then(() =>
          File.copyFile(path.join('..', 'dist', 'test', 'fixtures', 'file.txt'), path.join(directoryName, fileName)));
    });

    after('delete test user and session and remove created files and directories', () => {
      return User
        .remove(database, userId)
        .then(() => Session.remove(database, sessionId))
        .then(() => File.removeAtRelativePath(directoryName));
    });

    it('should respond with SESSION_NOT_FOUND error for missing Session-Id header', done => {
      let options = {
        json: true,
        method: 'GET',
        url: `http://localhost:${Config.port}/api/list/`
      };
      request(options, (err, res, body) => {
        expect(res.statusCode).to.equal(403);
        expect(body.err).to.have.all.members([Error.Code.SESSION_NOT_FOUND]);
        done();
      });
    });

    it('should respond with SESSION_NOT_FOUND error for invalid Session-Id header', done => {
      let options = {
        json: true,
        method: 'GET',
        url: `http://localhost:${Config.port}/api/list/`,
        headers: {
          'Session-Id': invalidSessionId
        }
      };
      request(options, (err, res, body) => {
        expect(res.statusCode).to.equal(403);
        expect(body.err).to.have.all.members([Error.Code.SESSION_NOT_FOUND]);
        done();
      });
    });

    it('should respond with static directory content for valid data', done => {
      let options = {
        json: true,
        method: 'GET',
        url: `http://localhost:${Config.port}/api/list/`,
        headers: {
          'Session-Id': sessionId
        }
      };
      request(options, (err, res, body) => {
        expect(res.statusCode).to.equal(200);
        expect(body.content).to.deep.equal([{name: directoryName, type: 'directory'}]);
        done();
      });
    });

    it('should respond with custom directory content for valid data', done => {
      let options = {
        json: true,
        method: 'GET',
        url: `http://localhost:${Config.port}/api/list/${directoryName}`,
        headers: {
          'Session-Id': sessionId
        }
      };
      request(options, (err, res, body) => {
        expect(res.statusCode).to.equal(200);
        expect(body.content).to.deep.equal([{name: fileName, type: 'file'}]);
        done();
      });
    });
  });
});
