const _ = require('lodash');
const Error = require('../utils/Error');
const Route = require('../utils/Route');

class ErrorCode {

  static GET(req, res, next) {
    let status;
    let body;

    status = 200;
    body = {success: true, errorCode: Error.Code};
    Route.prepareResponse(res, next, status, body);
  }
}

module.exports = ErrorCode;
