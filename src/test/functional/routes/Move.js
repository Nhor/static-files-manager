const path = require('path');
const expect = require('chai').expect;
const request = require('request');
const Config = require('../../../Config');
const Error = require('../../../utils/Error');
const Database = require('../../../utils/Database');
const File = require('../../../utils/File');
const User = require('../../../models/User');
const Session = require('../../../models/Session');

describe('Move', () => {

  describe('PUT', () => {

    let database;
    let userId;
    let sessionId;
    let invalidSessionId;
    let pathToSourceFile;
    let pathToDestinationFile;

    before('set up global properties and create test user, session and copy fixture file', () => {
      database = new Database(Config.database);
      let username = 'username';
      let password = 'password123';
      invalidSessionId = 'invalidSessionId';
      pathToSourceFile = 'file.txt';
      pathToDestinationFile = path.join('path', 'to', 'file.txt');
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
          return File.copyFile(path.join('..', 'dist', 'test', 'fixtures', 'file.txt'), 'file.txt');
        });
    });

    after('delete test user and session and remove created files and directories', () => {
      return User
        .remove(database, userId)
        .then(() => Session.remove(database, sessionId))
        .then(() => File.removeAtRelativePath('path'));
    });

    it('should respond with validation errors for empty body', done => {
      let options = {
        json: true,
        method: 'PUT',
        url: `http://localhost:${Config.port}/api/move`
      };
      request(options, (err, res, body) => {
        expect(res.statusCode).to.equal(400);
        expect(body.err).to.have.all.members([
          Error.Code.INVALID_PATH_FORMAT,
          Error.Code.INVALID_NEW_PATH_FORMAT
        ]);
        done();
      });
    });

    it('should respond with SESSION_NOT_FOUND error for missing Session-Id header', done => {
      let options = {
        json: true,
        method: 'PUT',
        url: `http://localhost:${Config.port}/api/move`,
        body: {
          path: pathToSourceFile,
          newPath: pathToDestinationFile
        }
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
        method: 'PUT',
        url: `http://localhost:${Config.port}/api/move`,
        body: {
          path: pathToSourceFile,
          newPath: pathToDestinationFile
        },
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

    it('should respond with success for valid data', done => {
      let options = {
        json: true,
        method: 'PUT',
        url: `http://localhost:${Config.port}/api/move`,
        body: {
          path: pathToSourceFile,
          newPath: pathToDestinationFile
        },
        headers: {
          'Session-Id': sessionId
        }
      };
      request(options, (err, res, body) => {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });

    it('should respond with FILE_NOT_FOUND error for the same data', done => {
      let options = {
        json: true,
        method: 'PUT',
        url: `http://localhost:${Config.port}/api/move`,
        body: {
          path: pathToSourceFile,
          newPath: pathToDestinationFile
        },
        headers: {
          'Session-Id': sessionId
        }
      };
      request(options, (err, res, body) => {
        expect(res.statusCode).to.equal(400);
        expect(body.err).to.have.all.members([Error.Code.FILE_NOT_FOUND]);
        done();
      });
    });
  });
});
