const expect = require('chai').expect;
const request = require('request');
const Config = require('../../../Config');
const Error = require('../../../utils/Error');
const Database = require('../../../utils/Database');
const User = require('../../../models/User');

describe('Login', () => {

  describe('POST', () => {

    let database;
    let username;
    let password;
    let invalidUsername;
    let invalidPassword;

    before('set up global properties and create test user', () => {
      database = new Database(Config.database);
      username = 'username';
      password = 'password123';
      invalidUsername = 'invalidUsername';
      invalidPassword = 'invalidPassword123';
      return User.create(database, username, password);
    });

    after('delete test user', () => {
      return User
        .getByUsername(database, username)
        .then(user => User.remove(database, user.id));
    });

    it('should respond with validation errors for empty body', done => {
      let options = {
        json: true,
        method: 'POST',
        url: `http://localhost:${Config.port}/api/login`
      };
      request(options, (err, res, body) => {
        expect(res.statusCode).to.equal(400);
        expect(body.err).to.have.all.members([
          Error.Code.INVALID_USERNAME_FORMAT,
          Error.Code.INVALID_PASSWORD_FORMAT
        ]);
        done();
      });
    });

    it('should respond with USER_NOT_FOUND error for invalid username', done => {
      let options = {
        json: true,
        method: 'POST',
        url: `http://localhost:${Config.port}/api/login`,
        body: {
          username: invalidUsername,
          password: password
        }
      };
      request(options, (err, res, body) => {
        expect(res.statusCode).to.equal(401);
        expect(body.err).to.have.all.members([Error.Code.USER_NOT_FOUND]);
        done();
      });
    });

    it('should respond with INVALID_PASSWORD error for invalid password', done => {
      let options = {
        json: true,
        method: 'POST',
        url: `http://localhost:${Config.port}/api/login`,
        body: {
          username: username,
          password: invalidPassword
        }
      };
      request(options, (err, res, body) => {
        expect(res.statusCode).to.equal(401);
        expect(body.err).to.have.all.members([Error.Code.INVALID_PASSWORD]);
        done();
      });
    });

    it('should respond with sessionId for valid data', done => {
      let options = {
        json: true,
        method: 'POST',
        url: `http://localhost:${Config.port}/api/login`,
        body: {
          username: username,
          password: password
        }
      };
      request(options, (err, res, body) => {
        expect(res.statusCode).to.equal(200);
        expect(body.sessionId).to.be.a('string');
        done();
      });
    });
  });
});
