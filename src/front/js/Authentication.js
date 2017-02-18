define(require => {
  let Config = require('./Config');
  let Cookie = require('./Cookie');
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
  }

  return Authentication;
});
