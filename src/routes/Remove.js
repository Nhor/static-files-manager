const _ = require('lodash');
const Error = require('../utils/Error');
const Logger = require('../utils/Logger');
const Validator = require('../utils/Validator');
const File = require('../utils/File');
const Route = require('../utils/Route');
const Session = require('../models/Session');

class Remove {

  static DELETE(req, res, next) {
    let context = res.locals.context;
    let status;
    let body;

    let validation = Validator.validate(req.body, {
      path: Validator.DirectoryOrFilePathRelativeToStaticField
    });

    if (!validation.success) {
      status = 400;
      body = {success: validation.success, err: _.map(validation.err, 'code')};
      return Route.prepareResponse(res, next, status, body);
    }

    let path = req.body.path;

    return Session
      .getById(context.database, req.headers['session-id'])
      .then(() => File.removeAtRelativePath(path))
      .then(() => {
        status = 200;
        body = {success: true};
        Route.prepareResponse(res, next, status, body);
      })
      .catch(err => {
        if (_.get(err, 'isCustom')) {
          if (err.code === Error.Code.SESSION_NOT_FOUND) status = 403;
          else status = 400;
          body = {success: false, err: [err.code]};
        } else {
          status = 500;
          body = {success: false, err: [Error.Code.UNKNOWN]};
          Logger.error(err && err.message);
        }
        Route.prepareResponse(res, next, status, body);
      });
  }
}

module.exports = Remove;
