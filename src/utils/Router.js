const path = require('path');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const multiparty = require('multiparty');
const Logger = require('./Logger');

class Router {

  /**
   * Handle class instance creation.
   */
  constructor() {
    this._router = express.Router();
    this.jsonMiddleware = bodyParser.json();
  }

  /**
   * Add route.
   * @param {String} method - HTTP method ('GET', 'POST', 'PUT' or 'DELETE').
   * @param {String} path - URL path.
   * @param {Function} handler - Handler function.
   * @param {Object} [context] - Context passed as `res.locals.context` to the
   *                             next middlewares and handler, defaults to `{}`.
   * @param {Object} [middleware] - Request middleware, defaults to JSON parser.
   */
  addRoute(method, path, handler, context = {}, middleware = 'json') {
    this._router[method.toLowerCase()](
      path,
      this._createBindContextMiddleware(context),
      this[`${middleware}Middleware`],
      this._incomingRequestLogMiddleware,
      handler,
      this._outgoingResponseLogMiddleware,
      this._sendResponseMiddleware
    );
  }

  /**
   * Get express Router object.
   * @return {express.Router} - Express Router object.
   */
  getRouter() {
    return this._router;
  }

  /**
   * Multipart middleware.
   * @param {express.Request} req - Express request object.
   * @param {express.Response} res - Express response object.
   * @param {Function} next - Express next function.
   */
  multipartMiddleware(req, res, next) {
    let form = new multiparty.Form({uploadDir: path.resolve(__dirname, '..', '..', 'tmp')});
    form.parse(req, (err, fields, files) => {
      if (err) Logger.error(err.message);
      req.body = _.merge({files: _.mapValues(files, _.first)}, _.mapValues(fields, _.first));
      next();
    });
  }

  /**
   * Create middleware to bind given context to the route `res.locals.context`.
   * @param {Object} context - Context object.
   * @return {Function} Context binding middleware.
   * @private
   */
  _createBindContextMiddleware(context) {
    return (req, res, next) => {
      res.locals.context = context;
      next();
    };
  }

  /**
   * Log incoming request middleware.
   * @param {express.Request} req - Express request object.
   * @param {express.Response} res - Express response object.
   * @param {Function} next - Express next function.
   * @private
   */
  _incomingRequestLogMiddleware(req, res, next) {
    Logger.info(
      `Incoming: "${req.method}" request from: "${req.headers['x-real-ip']}" ` +
      `to: "${req.originalUrl}" ` +
      `with body: "${JSON.stringify(_.omit(req.body, ['password']))}" ` +
      `and headers: "${JSON.stringify(req.headers)}".`
    );
    next();
  }

  /**
   * Log outgoing response middleware.
   * @param {express.Request} req - Express request object.
   * @param {express.Response} res - Express response object.
   * @param {Function} next - Express next function.
   * @private
   */
  _outgoingResponseLogMiddleware(req, res, next) {
    Logger.info(
      `Outgoing response from: "${req.originalUrl}" ` +
      `to: "${req.headers['x-real-ip']}" ` +
      `with body: "${JSON.stringify(res.locals.body)}" ` +
      `and status: "${JSON.stringify(res.locals.status)}".`
    );
    next();
  }

  /**
   * Send response middleware, should be used as the last provided middleware.
   * @param {express.Request} req - Express request object.
   * @param {express.Response} res - Express response object.
   * @param {Function} next - Express next function.
   * @private
   */
  _sendResponseMiddleware(req, res, next) {
    res.status(res.locals.status);
    res.type(res.locals.type);
    res.send(res.locals.body);
    next();
  }
}

module.exports = Router;
