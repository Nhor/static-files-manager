const _ = require('lodash');
const uuid = require('uuid');
const Error = require('../utils/Error');

class Session {

  /**
   * Create session for user with given ID.
   * @param {Database} database - Used database object.
   * @param {Object} sessionProps - Object with session `type` and `realm`.
   * @param {Number} userId - User ID.
   * @return {Promise} Resolved promise with session attributes.
   */
  static create(database, sessionProps, userId) {
    let sessionIdentifier = this._createIdentifier(sessionProps.type, sessionProps.realm);
    let query =
      `INSERT INTO session (id, user_id) ` +
      `VALUES ('${sessionIdentifier}', ${userId});`;
    return database.execute(query);
  }

  /**
   * Get existing or create new session for user with given ID.
   * @param {Database} database - Used database object.
   * @param {Object} sessionProps - Object with session `type` and `realm`.
   * @param {Number} userId - User ID.
   * @return {Promise} Resolved promise with session attributes.
   */
  static getOrCreate(database, sessionProps, userId) {
    let query =
      `SELECT id ` +
      `FROM session ` +
      `WHERE user_id=${userId};`;
    return database
      .execute(query)
      .then(rows => {
        let session = _.first(rows);
        return session
          ? Promise.resolve(session)
          : this
            .create(database, sessionProps, userId)
            .then(() => this.getByUserId(database, userId));
      });
  }

  /**
   * Remove session.
   * @param {Database} database - Used database object.
   * @param {String} id - Session identifier.
   * @return {Promise} Resolved promise on success,
   *                   rejected promise with error otherwise.
   */
  static remove(database, id) {
    let query =
      `DELETE FROM session ` +
      `WHERE id='${id}';`;
    return database.execute(query);
  }

  /**
   * Get session by identifier.
   * @param {Database} database - Used database object.
   * @param {String} id - Session identifier.
   * @return {Promise} Resolved promise with session attributes.
   */
  static getById(database, id) {
    let query =
      `SELECT id, user_id, created_at ` +
      `FROM session ` +
      `WHERE id='${id}';`;
    return database
      .execute(query)
      .then(rows => {
        let session = _.first(rows);
        if (!session) throw new Error.RecordDoesNotExist(Error.Code.SESSION_NOT_FOUND);
        return session;
      });
  }

  /**
   * Get session by user identifier.
   * @param {Database} database - Used database object.
   * @param {Number} userId - User identifier.
   * @return {Promise} Resolved promise with session attributes.
   */
  static getByUserId(database, userId) {
    let query =
      `SELECT id, user_id, created_at ` +
      `FROM session ` +
      `WHERE user_id='${userId}';`;
    return database
      .execute(query)
      .then(rows => {
        let session = _.first(rows);
        if (!session) throw new Error.RecordDoesNotExist(Error.Code.SESSION_NOT_FOUND);
        return session;
      });
  }

  /**
   * Create session identifier.
   * @return {String} Session identifier.
   * @private
   */
  static _createIdentifier(sessionType, sessionRealm) {
    let identifier = uuid.v4().replace(/-/g, '');
    return ['SID', sessionType, sessionRealm, identifier].join(':');
  }
}

module.exports = Session;
