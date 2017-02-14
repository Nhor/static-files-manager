const path = require('path');
const _ = require('lodash');
const sqlite3 = require('sqlite3');

class Database {

  /**
   * Handle class instance creation.
   * @param {String} database - Database path relative to application root.
   */
  constructor(database) {
    this._db = new sqlite3.Database(path.resolve(__dirname, '..', '..', database));
  }

  /**
   * Execute given SQL query with given arguments.
   * @param {String} query - SQL query to be executed.
   * @param {String[]} [args] - Optional query arguments, defaults to `[]`.
   * @returns {Promise} Resolved promise with data in case of successful action,
   *                    rejected promise with error otherwise.
   */
  execute(query) {
    return new Promise((resolve, reject) =>
      this._db.all(query, (err, rows) => {
        if (err) return reject(err);
        let result = _.map(rows, row => _.mapKeys(row, (value, col) => _.camelCase(col)));
        return resolve(result);
      })
    );
  }
}

module.exports = Database;
