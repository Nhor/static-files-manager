let _ = require('lodash');
let Error = require('./Error');

class Validator {

  /**
   * Check if value is valid password.
   * @param {any} val - Value to validate.
   * @return {Boolean} `true` if validation was successful, `false` otherwise.
   */
  static PasswordField(val) {
    return _.isString(val) && /^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9$@!%*#?&]{6,32}$/.test(val);
  }

  /**
   * Check if value is valid username.
   * @param {any} val - Value to validate.
   * @return {Boolean} `true` if validation was successful, `false` otherwise.
   */
  static UsernameField(val) {
    return _.isString(val) && /^(?=.*[A-Za-z])[0-9a-zA-Z-_]{2,16}$/.test(val);
  }

  /**
   * Validate given values against expected fields.
   * @param {Object} data - Object with values to validate.
   * @param {Object} expectedFields - Object with expected data format.
   * @return {undefined|Object} Object with overall validation bool result and
   *                            array of InvalidFormat errors with proper codes.
   */
  static validate(data, expectedFields) {
    let err = _
      .chain(expectedFields)
      .map((fieldValidator, fieldName) => {
        return fieldValidator(_.get(data, fieldName))
          ? null
          : new Error.InvalidFormat(_.get(Error.Code, `INVALID_${_.snakeCase(fieldName).toUpperCase()}_FORMAT`))
      })
      .filter(fieldName => !_.isNull(fieldName))
      .value();
    return {success: _.isEmpty(err), err: err};
  }
}

module.exports = Validator;
