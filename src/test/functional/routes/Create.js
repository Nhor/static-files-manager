const path = require('path');
const expect = require('chai').expect;
const request = require('request');
const Config = require('../../../Config');
const Error = require('../../../utils/Error');
const Database = require('../../../utils/Database');
const File = require('../../../utils/File');
const User = require('../../../models/User');
const Session = require('../../../models/Session');

describe('Create', () => {

  describe('POST', () => {

    let database;
    let userId;
    let sessionId;
    let invalidSessionId;
    let pathToDirectory;

    before('set up global properties and create test user and session', () => {
      database = new Database(Config.database);
      let username = 'username';
      let password = 'password123';
      invalidSessionId = 'invalidSessionId';
      pathToDirectory = path.join('path', 'to', 'directory');
      return User
        .create(database, username, password)
        .then(() => User.getByUsername(database, username))
        .then(user => {
          userId = user.id;
          return Session.create(database, Config.session, userId)
        })
        .then(() => Session.getByUserId(database, userId))
        .then(session => sessionId = session.id);
    });

    after('delete test user, session and created file', () => {
      return User
        .remove(database, userId)
        .then(() => Session.remove(database, sessionId))
        .then(() => File.removeAtRelativePath('path'));
    });

    it('should respond with validation errors for empty body', done => {
      let options = {
        json: true,
        method: 'POST',
        url: `http://localhost:${Config.port}/api/create`
      };
      request(options, (err, res, body) => {
        expect(res.statusCode).to.equal(400);
        expect(body.err).to.have.all.members([Error.Code.INVALID_PATH_FORMAT]);
        done();
      });
    });

    it('should respond with SESSION_NOT_FOUND error for missing Session-Id header', done => {
      let options = {
        json: true,
        method: 'POST',
        url: `http://localhost:${Config.port}/api/create`,
        body: {
          path: pathToDirectory
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
        method: 'POST',
        url: `http://localhost:${Config.port}/api/create`,
        body: {
          path: pathToDirectory
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
        method: 'POST',
        url: `http://localhost:${Config.port}/api/create`,
        body: {
          path: pathToDirectory
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

    it('should respond with DIRECTORY_EXISTS error for the same data', done => {
      let options = {
        json: true,
        method: 'POST',
        url: `http://localhost:${Config.port}/api/create`,
        body: {
          path: pathToDirectory
        },
        headers: {
          'Session-Id': sessionId
        }
      };
      request(options, (err, res, body) => {
        expect(res.statusCode).to.equal(400);
        expect(body.err).to.have.all.members([Error.Code.DIRECTORY_EXISTS]);
        done();
      });
    });
  });
});
