let _ = require('lodash');
let bcrypt = require('bcrypt');
let Error = require('../utils/Error');

class User {

  /**
   * Create new user.
   * @param {Database} database - Used database object.
   * @param {String} username - User username.
   * @param {String} password - User plain text password.
   * @return {Promise} Resolved promise with new user object on success,
   *                   rejected promise with error otherwise.
   */
  static create(database, username, password) {
    return this
      ._createHashedPassword(password)
      .then(hashedPassword => {
        let query =
          `INSERT INTO user (username, password) ` +
          `VALUES ('${username}', '${hashedPassword}');`;
        return database.execute(query);
      });
  }

  /**
   * Get user by provided email or username and password.
   * @param {Database} database - Used database object.
   * @param {String} username - User username.
   * @param {String} password - User plain text password.
   * @return {Promise} Resolved promise with user identifier on success,
   *                   rejected promise with error otherwise.
   */
  static login(database, username, password) {
    let query =
      `SELECT id, password ` +
      `FROM user ` +
      `WHERE username='${username}';`;
    return database
      .execute(query)
      .then(rows => {
        let user = _.first(rows);
        if (!user) throw new Error.RecordDoesNotExist(Error.Code.USER_NOT_FOUND);
        this.userId = user.id;
        return this._comparePlainTextPasswordWithHashedPassword(password, user.password);
      })
      .then(res => {
        if (!res) throw new Error.InvalidValue(Error.Code.INVALID_PASSWORD);
        return this.userId;
      });
  }

  /**
   * Remove user.
   * @param {Database} database - Used database object.
   * @param {String} id - User identifier.
   * @return {Promise} Resolved promise on success,
   *                   rejected promise with error otherwise.
   */
  static remove(database, id) {
    let query =
      `DELETE FROM user ` +
      `WHERE id=${id};`;
    return database.execute(query);
  }

  /**
   * Get user by identifier.
   * @param {Database} database - Used database object.
   * @param {String} id - User identifier.
   * @return {Promise} Resolved promise with user object on success,
   *                   rejected promise with error otherwise.
   */
  static getById(database, id) {
    let query =
      `SELECT id, username, created_at, modified_at ` +
      `FROM user ` +
      `WHERE id=${id};`;
    return database
      .execute(query)
      .then(rows => {
        let user = _.first(rows);
        if (!user) throw new Error.RecordDoesNotExist(Error.Code.USER_NOT_FOUND);
        return user;
      });
  }

  /**
   * Get user by username.
   * @param {Database} database - Used database object.
   * @param {String} username - User username.
   * @return {Promise} Resolved promise with user object on success,
   *                   rejected promise with error otherwise.
   */
  static getByUsername(database, username) {
    let query =
      `SELECT id, username, created_at, modified_at ` +
      `FROM user ` +
      `WHERE username='${username}';`;
    return database
      .execute(query)
      .then(rows => {
        let user = _.first(rows);
        if (!user) throw new Error.RecordDoesNotExist(Error.Code.USER_NOT_FOUND);
        return user;
      });
  }

  /**
   * Create hashed password out of given plain text password.
   * @param {String} password - Plain text password.
   * @return {Promise} Resolved promise with hashed password on success,
   *                   rejected promise with error otherwise.
   * @private
   */
  static _createHashedPassword(password) {
    return new Promise((resolve, reject) =>
      bcrypt.hash(password, 10, (err, hash) => err ? reject(err) : resolve(hash)));
  }

  /**
   * Compare plain text password with hashed password.
   * @param {String} plainText - Plain text password.
   * @param {String} hash - Hashed password.
   * @return {Promise} Resolved promise with boolean comparison result on success,
   *                   rejected promise with error otherwise.
   * @private
   */
  static _comparePlainTextPasswordWithHashedPassword(plainText, hash) {
    return new Promise((resolve, reject) =>
      bcrypt.compare(plainText, hash, (err, res) => err ? reject(err) : resolve(res)));
  }
}

module.exports = User;
