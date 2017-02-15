const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;
const request = require('request');
const Config = require('../../../Config');
const Error = require('../../../utils/Error');
const Database = require('../../../utils/Database');
const File = require('../../../utils/File');
const User = require('../../../models/User');
const Session = require('../../../models/Session');

describe('Upload', () => {

  describe('POST', () => {

    let database;
    let userId;
    let sessionId;
    let invalidSessionId;
    let pathToFile;
    let invalidPathToFile;
    let filename;
    let pathname;
    let ext;

    before('set up global properties and create test user and session', () => {
      database = new Database(Config.database);
      let username = 'username';
      let password = 'password123';
      invalidSessionId = 'invalidSessionId';
      pathToFile = path.resolve(__dirname, '..', '..', 'fixtures', 'file.txt');
      invalidPathToFile = path.resolve(__dirname, '..', '..', 'fixtures', 'invalidFile.txt');
      filename = 'file';
      pathname = 'path/to';
      ext = 'txt';
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

    it('should respond with validation errors for empty form data', done => {
      let options = {
        method: 'POST',
        url: `http://localhost:${Config.port}/api/upload`,
        formData: {}
      };
      request(options, (err, res, body) => {
        body = JSON.parse(body);
        expect(res.statusCode).to.equal(400);
        expect(body.err).to.have.all.members([
          Error.Code.INVALID_FILES_FORMAT,
          Error.Code.INVALID_PATH_FORMAT,
          Error.Code.INVALID_FILENAME_FORMAT,
          Error.Code.INVALID_EXT_FORMAT
        ]);
        done();
      });
    });

    it('should respond with SESSION_NOT_FOUND error for missing Session-Id header', done => {
      let options = {
        json: true,
        method: 'POST',
        url: `http://localhost:${Config.port}/api/upload`,
        formData: {
          file: fs.createReadStream(pathToFile),
          path: pathname,
          filename: filename,
          ext: ext
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
        url: `http://localhost:${Config.port}/api/upload`,
        formData: {
          file: fs.createReadStream(pathToFile),
          path: pathname,
          filename: filename,
          ext: ext
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

    it('should respond with SESSION_NOT_FOUND error for invalid Session-Id header', done => {
      let options = {
        json: true,
        method: 'POST',
        url: `http://localhost:${Config.port}/api/upload`,
        formData: {
          file: fs.createReadStream(pathToFile),
          path: pathname,
          filename: filename,
          ext: ext
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

    it('should respond with {"success": true} for valid data', done => {
      let options = {
        json: true,
        method: 'POST',
        url: `http://localhost:${Config.port}/api/upload`,
        formData: {
          file: fs.createReadStream(pathToFile),
          path: pathname,
          filename: filename,
          ext: ext
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
  });
});
