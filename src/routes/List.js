const _ = require('lodash');
const Error = require('../utils/Error');
const Logger = require('../utils/Logger');
const Validator = require('../utils/Validator');
const File = require('../utils/File');
const Route = require('../utils/Route');
const Session = require('../models/Session');

class List {

  static GET(req, res, next) {
    let context = res.locals.context;
    let status;
    let body;

    req.params.path = req.params[0];

    let validation = Validator.validate(req.params, {
      path: Validator.DirectoryPathRelativeToStaticField
    });

    if (!validation.success) {
      status = 400;
      body = {success: validation.success, err: _.map(validation.err, 'code')};
      return Route.prepareResponse(res, next, status, body);
    }

    let path = req.params.path;

    return Session
      .getById(context.database, req.headers['session-id'])
      .then(() => File.listDirectory(path))
      .then(directoryContent => {
        status = 200;
        body = {success: true, content: directoryContent};
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

module.exports = List;
