const fs = require('fs');
const path = require('path');
const moment = require('moment');

try { fs.mkdirSync(path.resolve(__dirname, '..', '..', 'logs')); }
catch (err) { if (err.code !== 'EEXIST') throw err; }

class Logger {

  /**
   * Log information message.
   * @param {String} text
   */
  static info(text) {
    this._print('info', text);
  }

  /**
   * Log warning message.
   * @param {String} text
   */
  static warn(text) {
    this._print('warn', text);
  }

  /**
   * Log error message.
   * @param {String} text
   */
  static error(text) {
    this._print('error', text);
  }

  /**
   * Get current date time.
   * @returns {String} Current date time as formatted string.
   * @private
   */
  static _getDateTime() {
    return moment().format('YYYY-MM-DD HH:mm:ss.SSS');
  }

  /**
   * Print a log message to STDOUT and save it in a log file.
   * @param {String} type - Type of log ('info', 'warn' or 'error').
   * @param {String} text - Log message.
   * @private
   */
  static _print(type, text) {
    let dateTime = this._getDateTime();
    let log = `${dateTime}: ${type.toUpperCase()}: ${text}`;
    let path = `${__dirname}/../logs/${dateTime.substr(0, 10)}.log`;
    console[type.toLowerCase()](log);
    fs.appendFile(path, `${log}\n`, {encoding: 'utf8'}, () => {});
  }
}

module.exports = Logger;
