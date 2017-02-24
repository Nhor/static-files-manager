define(require => {
  let _ = require('lodash');
  let Config = require('./Config');
  let Cookie = require('./Cookie');
  let Cache = require('./Cache');
  let Request = require('./Request');

  class Authentication {

    /**
     * Set a cookie with session identifier.
     * @param {String} sessionId - Session identifier.
     */
    static setSessionId(sessionId) {
      Cookie.set(Config.session.cookie, sessionId, Config.session.lifetime);
    }

    /**
     * Get session identifier from a cookie.
     * @return {String|undefined} Session identifier or `undefined` if not set.
     */
    static getSessionId() {
      return Cookie.get(Config.session.cookie);
    }

    /**
     * Check if user is authenticated.
     * @return {Promise} Resolved promise with `true` or `false` value.
     */
    static check() {
      return Request
        .get('/check', true)
        .then(res => res.body.success)
        .catch(err => false);
    }

    /**
     * Send login request with given user username and password.
     * @param {String} username - User username.
     * @param {String} password - User password.
     * @return {Promise} Resolved promise with response data on success,
     *                   rejected promise with error on failure.
     */
    static login(username, password) {
      let data = {username: username, password: password};
      return Request
        .post('/login', false, data)
        .then(res => {
          let sessionId = _.get(res, 'body.sessionId');
          if (!sessionId)
            throw new Error({response: {body: {err: [0]}}});
          this.setSessionId(sessionId);
          return sessionId;
        })
        .catch(err => {
          let errorCode = Cache.get('errorCode');
          let errors = _.get(err, 'response.body.err', [0]);

          let error = new Error();
          error.messages = _.map(errors, error => _.get(errorCode, error, errorCode[0]));
          throw error;
        });
    }
  }

  return Authentication;
});
