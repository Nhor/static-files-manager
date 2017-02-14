const Error = require('../utils/Error');
const Logger = require('../utils/Logger');
const Validator = require('../utils/Validator');
const Route = require('../utils/Route');
const Session = require('../models/Session');

class Logout {

  static POST(req, res, next) {
    let context = res.locals.context;
    let status;
    let body;

    return Session
      .getById(context.database, req.headers['session-id'])
      .then(() => Session.remove(context.database, req.headers['session-id']))
      .then(() => {
        status = 200;
        body = {success: true};
        Route.prepareResponse(res, next, status, body);
      })
      .catch(err => {
        if (err.isCustom) {
          status = 403;
          body = {success: false, err: [err.code]};
        } else {
          status = 500;
          body = {success: false, err: [Error.Code.UNKNOWN]};
          Logger.error(err.message);
        }
        Route.prepareResponse(res, next, status, body)
      });
  }
}

module.exports = Logout;
