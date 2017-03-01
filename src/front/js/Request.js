define(require => {
  let _ = require('lodash');
  let request = require('superagent');
  let Config = require('./Config');
  let Cookie = require('./Cookie');

  class Request {

    static get ContentType() {
      return {
        json: 'application/json',
        multipart: 'multipart/form-data'
      };
    }

    /**
     * Get a static file from static files server.
     * @param {String} path - Relative path to a static file.
     */
    static getStatic(path) {
      let tab = window.open(`${Config.static.url}${path}`, '_blank');
      tab.focus();
    }

    /**
     * Perform a GET HTTP request.
     * @param {String} path - HTTP request path.
     * @param {Boolean} authenticationRequired - Include Session-Id header or not.
     * @param {Object} [query] - Optional object containing query params.
     * @returns {Promise} - Resolved or rejected promise with response object.
     */
    static get(path, authenticationRequired, query) {
      let ajax = request.get(`${Config.api.url}${path}`);

      if (authenticationRequired)
        ajax.set('Session-Id', Cookie.get(Config.session.cookie) || '');

      if (query)
        ajax.query(query);

      return ajax;
    }

    /**
     * Perform a POST HTTP request.
     * @param {String} path - HTTP request path.
     * @param {Boolean} authenticationRequired - Include Session-Id header or not.
     * @param {Object} data - Object to be sent as a POST request data.
     * @param {String} [contentType] - Optional string with Content-Type header,
     *                                 defaults to 'application/json'.
     * @returns {Promise} - Resolved or rejected promise with response object.
     */
    static post(path, authenticationRequired, data, contentType = this.ContentType.json) {
      let ajax = request.post(`${Config.api.url}${path}`);

      if (authenticationRequired)
        ajax.set('Session-Id', Cookie.get(Config.session.cookie) || '');

      switch (contentType) {
        case this.ContentType.json:
          ajax.send(data);
          break;
        case this.ContentType.multipart:
          _.each(data, (value, key) => {
            let attachOrField = key === 'files' ? 'attach' : 'field';
            ajax[attachOrField](key, value);
          });
          break;
      }

      return ajax;
    }

    /**
     * Perform a PUT HTTP request.
     * @param {String} path - HTTP request path.
     * @param {Boolean} authenticationRequired - Include Session-Id header or not.
     * @param {Object} data - Object to be sent as a POST request data.
     * @param {String} [contentType] - Optional string with Content-Type header,
     *                                 defaults to 'application/json'.
     * @returns {Promise} - Resolved or rejected promise with response object.
     */
    static put(path, authenticationRequired, data, contentType = this.ContentType.json) {
      let ajax = request.put(`${Config.api.url}${path}`);

      if (authenticationRequired)
        ajax.set('Session-Id', Cookie.get(Config.session.cookie) || '');

      ajax.set('Content-Type', contentType);

      switch (contentType) {
        case this.ContentType.json:
          ajax.send(data);
          break;
        case this.ContentType.multipart:
          _.each(data, (value, key) => ajax.attach(key, value));
          break;
      }

      return ajax;
    }

    /**
     * Perform a DELETE HTTP request.
     * @param {String} path - HTTP request path.
     * @param {Boolean} authenticationRequired - Include Session-Id header or not.
     * @param {Object} [query] - Optional object containing query params.
     * @returns {Promise} - Resolved or rejected promise with response object.
     */
    static delete(path, authenticationRequired, query) {
      let ajax = request.delete(`${Config.api.url}${path}`);

      if (authenticationRequired)
        ajax.set('Session-Id', Cookie.get(Config.session.cookie) || '');

      if (query)
        ajax.query(query);

      return ajax;
    }
  }

  return Request;
});
