const expect = require('chai').expect;
const request = require('request');
const Config = require('../../../Config');
const Error = require('../../../utils/Error');
const Database = require('../../../utils/Database');
const User = require('../../../models/User');
const Session = require('../../../models/Session');

describe('Check', () => {

  describe('GET', () => {

    let database;
    let userId;
    let sessionId;
    let invalidSessionId;

    before('set up global properties and create test user', () => {
      database = new Database(Config.database);
      let username = 'username';
      let password = 'password123';
      invalidSessionId = 'invalidSessionId';
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

    after('delete test user and sessionId', () => {
      return User
        .remove(database, userId)
        .then(() => Session.remove(database, sessionId));
    });

    it('should respond with SESSION_NOT_FOUND error for missing Session-Id header', done => {
      let options = {
        json: true,
        method: 'GET',
        url: `http://localhost:${Config.port}/api/check`
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
        url: `http://localhost:${Config.port}/api/check`,
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
        method: 'GET',
        url: `http://localhost:${Config.port}/api/check`,
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
