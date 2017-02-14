const _ = require('lodash');
const Error = require('../utils/Error');
const Logger = require('../utils/Logger');
const Validator = require('../utils/Validator');
const File = require('../utils/File');
const Route = require('../utils/Route');

class Upload {

  static POST(req, res, next) {
    let context = res.locals.context;
    let status;
    let body;

    let validation = Validator.validate(req.body, {
      path: Validator.PathField,
      filename: Validator.FileNameField,
      ext: Validator.FileExtensionField,
      files: Validator.FileField
    });

    if (!validation.success) {
      status = 400;
      body = {success: validation.success, err: _.map(validation.err, 'code')};
      Route.prepareResponse(res, next, status, body);
    }

    let path = req.body.path;
    let filename = req.body.filename;
    let ext = req.body.ext;
    let file = _.get(req.body.files, _.first(_.keys(req.body.files)));

    File
      .create(file.path, path, filename, ext)
      .then(() => {
        status = 200;
        body = {success: true};
        Route.prepareResponse(res, next, status, body);
      })
      .catch(err => {
        if (_.get(err, 'isCustom')) {
          status = 400;
          body = {success: false, err: [err.code]};
        } else {
          status = 500;
          body = {success: false, err: [Error.Code.UNKNOWN]};
          Logger.error(err && err.message);
        }
        Route.prepareResponse(res, next, status, body)
      });
  }
}

module.exports = Upload;
