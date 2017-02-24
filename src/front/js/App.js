define(require => {
  let _ = require('lodash');
  let Cache = require('./Cache');
  let Request = require('./Request');

  class App {

    /**
     * Initialize application.
     */
    static init() {
      Cache.set('errorCode', {UNKNOWN: 0});
      Request
        .get('/error-code', false)
        .then(res => {
          let errorCode = _.get(res, 'body.errorCode', [{UNKNOWN: 0}]);
          errorCode = _.mapValues(_.invert(errorCode), errorName => {
            switch (errorName) {
              case 'UNKNOWN':
                return 'Unknown error occurred.';
              case 'INVALID_USERNAME_FORMAT':
                return 'Invalid username format.';
              case 'INVALID_PASSWORD_FORMAT':
                return 'Invalid password format.';
              case 'USER_NOT_FOUND':
                return 'Provided user does not exist.';
              case 'INVALID_PASSWORD':
                return 'Provided password is invalid.';
            }
          });
          Cache.set('errorCode', errorCode);
        });
    }
  }

  return App;
});
