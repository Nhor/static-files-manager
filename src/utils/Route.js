class Route {

  /**
   * Prepare and save response values to be sent.
   * @param {express.Response} res - Express response object.
   * @param {Function} next - Express next function.
   * @param {Number} status - Response status.
   * @param {Object} body - Response body.
   * @param {String} [type] - Optional response type, defaults to 'json'.
   */
  static prepareResponse(res, next, status, body, type = 'json') {
    res.locals.status = status;
    res.locals.type = type;
    res.locals.body = body;
    next();
  }
}

module.exports = Route;
