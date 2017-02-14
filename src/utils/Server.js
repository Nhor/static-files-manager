const express = require('express');

class Server {

  /**
   * Handle class instance creation.
   * @param {String} name - Application name.
   * @param {String} version - Application version.
   * @param {Number} port - Application port to run on.
   */
  constructor(name, version, port) {
    this._name = name;
    this._version = version;
    this._port = port;
    this._server = express();
  }

  /**
   * Add router.
   * @param {String} path - Base path for all routes present in the router.
   * @param {Router} router - Router object.
   */
  addRouter(path, router) {
    this._server.use(path, router.getRouter());
  }

  /**
   * Start listening.
   * @returns {Promise} Resolved promise with server `name`, `version` and `port`.
   */
  listen() {
    return new Promise((resolve, reject) =>
      this._server.listen(this._port, () => resolve({
        name: this._name,
        version: this._version,
        port: this._port
      })));
  }
}

module.exports = Server;
