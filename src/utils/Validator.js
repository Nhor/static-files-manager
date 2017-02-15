const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const Error = require('./Error');

class Validator {

  /**
   * Check if value is valid path for directory or file relative to static.
   * @param {any} val - Value to validate.
   * @return {Boolean} `true` if validation was successful, `false` otherwise.
   */
  static DirectoryOrFilePathRelativeToStaticField(val) {
    let staticPath = path.resolve(__dirname, '..', '..', 'static');
    let absolutePath = path.resolve(staticPath, _.trim(val, '/'));
    let pathRelativeToStatic = path.relative(staticPath, absolutePath);
    return !_.isEmpty(pathRelativeToStatic) && !_.startsWith(pathRelativeToStatic, '..');
  }

  /**
   * Check if value is valid file.
   * @param {any} val - Value to validate.
   * @return {Boolean} `true` if validation was successful, `false` otherwise.
   */
  static FileField(val) {
    let file = _.get(val, _.first(_.keys(val)));
    return _.isObject(file) && fs.statSync(file.path).isFile();
  }

  /**
   * Check if value is valid file extension.
   * @param {any} val - Value to validate.
   * @return {Boolean} `true` if validation was successful, `false` otherwise.
   */
  static FileExtensionField(val) {
    return _.isString(val) && /^[0-9a-zA-Z]{0,16}$/.test(val);
  }

  /**
   * Check if value is valid file name.
   * @param {any} val - Value to validate.
   * @return {Boolean} `true` if validation was successful, `false` otherwise.
   */
  static FileNameField(val) {
    return _.isString(val) && /^[0-9a-zA-Z-_ ]{1,64}$/.test(val);
  }

  /**
   * Check if value is valid password.
   * @param {any} val - Value to validate.
   * @return {Boolean} `true` if validation was successful, `false` otherwise.
   */
  static PasswordField(val) {
    return _.isString(val) && /^(?=.*[a-zA-Z])(?=.*[0-9])[0-9a-zA-Z$@!%*#?&]{6,32}$/.test(val);
  }

  /**
   * Check if value is valid path.
   * @param {any} val - Value to validate.
   * @return {Boolean} `true` if validation was successful, `false` otherwise.
   */
  static PathField(val) {
    return _.isString(val) && /^(?!.*(\/)\1+)[0-9a-zA-Z/\-_ ]{0,128}$/.test(val);
  }

  /**
   * Check if value is valid username.
   * @param {any} val - Value to validate.
   * @return {Boolean} `true` if validation was successful, `false` otherwise.
   */
  static UsernameField(val) {
    return _.isString(val) && /^(?=.*[a-zA-Z])[0-9a-zA-Z-_]{2,16}$/.test(val);
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
