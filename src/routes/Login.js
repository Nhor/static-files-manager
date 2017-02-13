let _ = require('lodash');
let Error = require('../utils/Error');
let Logger = require('../utils/Logger');
let Validator = require('../utils/Validator');
let Route = require('../utils/Route');
let User = require('../models/User');
let Session = require('../models/Session');

class Login {

  static POST(req, res, next) {
    let context = res.locals.context;
    let status;
    let body;

    let validation = Validator.validate(req.body, {
      username: Validator.UsernameField,
      password: Validator.PasswordField
    });

    if (!validation.success) {
      status = 400;
      body = {success: validation.success, err: _.map(validation.err, 'code')};
      Route.prepareResponse(res, next, status, body);
    }

    let username = req.body.username;
    let password = req.body.password;

    User
      .login(context.database, username, password)
      .then(userId => Session.getOrCreate(context.database, context.sessionProps, userId))
      .then(session => {
        status = 200;
        body = {success: true, sessionId: session.id};
        Route.prepareResponse(res, next, status, body);
      })
      .catch(err => {
        if (err.code) {
          status = 401;
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

module.exports = Login;
