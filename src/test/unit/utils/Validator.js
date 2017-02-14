const _ = require('lodash');
const expect = require('chai').expect;
const Error = require('../../../utils/Error');
const Validator = require('../../../utils/Validator');

describe('Validator', () => {

  describe('FileExtensionField', () => {

    it('should return false on null', () =>
      expect(Validator.FileExtensionField(null)).to.be.false);

    it('should return false on number', () =>
      expect(Validator.FileExtensionField(1)).to.be.false);

    it('should return false on string with invalid characters', () =>
      expect(Validator.FileExtensionField('ext^')).to.be.false);

    it('should return false on too long string', () =>
      expect(Validator.FileExtensionField('tooLongFileExtension')).to.be.false);

    it('should return true on empty string', () =>
      expect(Validator.FileExtensionField('')).to.be.true);

    it('should return true on valid file extension string', () =>
      expect(Validator.FileExtensionField('ext')).to.be.true);

    it('should return true on valid string with lowercase and uppercase characters and digits', () =>
      expect(Validator.FileExtensionField('Ext1')).to.be.true);
  });

  describe('FileNameField', () => {

    it('should return false on null', () =>
      expect(Validator.FileNameField(null)).to.be.false);

    it('should return false on number', () =>
      expect(Validator.FileNameField(1)).to.be.false);

    it('should return false on empty string', () =>
      expect(Validator.FileNameField('')).to.be.false);

    it('should return false on string with invalid characters', () =>
      expect(Validator.FileNameField('filename^')).to.be.false);

    it('should return false on too long string', () =>
      expect(Validator.FileNameField(_.times(65, _.constant(0)).join(''))).to.be.false);

    it('should return true on valid file name string', () =>
      expect(Validator.FileNameField('filename')).to.be.true);

    it('should return true on valid string with lowercase and uppercase characters and digits', () =>
      expect(Validator.FileNameField('FileName1')).to.be.true);
  });

  describe('PasswordField', () => {

    it('should return false on null', () =>
      expect(Validator.PasswordField(null)).to.be.false);

    it('should return false on number', () =>
      expect(Validator.PasswordField(1)).to.be.false);

    it('should return false on empty string', () =>
      expect(Validator.PasswordField('')).to.be.false);

    it('should return false on too short string', () =>
      expect(Validator.PasswordField('p')).to.be.false);

    it('should return false on string with invalid characters', () =>
      expect(Validator.PasswordField('password^')).to.be.false);

    it('should return false on string without numbers', () =>
      expect(Validator.PasswordField('password')).to.be.false);

    it('should return true on valid password string', () =>
      expect(Validator.PasswordField('password123')).to.be.true);

    it('should return true on valid password string with special characters', () =>
      expect(Validator.PasswordField('password123!@#')).to.be.true);
  });

  describe('PathField', () => {

    it('should return false on null', () =>
      expect(Validator.PathField(null)).to.be.false);

    it('should return false on number', () =>
      expect(Validator.PathField(1)).to.be.false);

    it('should return false on string with invalid characters', () =>
      expect(Validator.PathField('path^')).to.be.false);

    it('should return false on string with invalid characters', () =>
      expect(Validator.PathField('path/to/file^')).to.be.false);

    it('should return false on string with duplicate "/"', () =>
      expect(Validator.PathField('path//to/file')).to.be.false);

    it('should return false on string with many "/" in a row', () =>
      expect(Validator.PathField('path///to////file')).to.be.false);

    it('should return false on too long string', () =>
      expect(Validator.PathField(_.times(129, _.constant(0)).join(''))).to.be.false);

    it('should return true on empty string', () =>
      expect(Validator.PathField('')).to.be.true);

    it('should return true on valid path string', () =>
      expect(Validator.PathField('path')).to.be.true);

    it('should return true on valid string with lowercase and uppercase characters and digits', () =>
      expect(Validator.PathField('Path1/To2/File3')).to.be.true);
  });

  describe('UsernameField', () => {

    it('should return false on null', () =>
      expect(Validator.UsernameField(null)).to.be.false);

    it('should return false on number', () =>
      expect(Validator.UsernameField(1)).to.be.false);

    it('should return false on empty string', () =>
      expect(Validator.UsernameField('')).to.be.false);

    it('should return false on too short string', () =>
      expect(Validator.UsernameField('u')).to.be.false);

    it('should return false on string with invalid characters', () =>
      expect(Validator.UsernameField('u!')).to.be.false);

    it('should return true on valid username string', () =>
      expect(Validator.UsernameField('username')).to.be.true);

    it('should return true on valid username string with "-" and "_"', () =>
      expect(Validator.UsernameField('-user_name-')).to.be.true);
  });

  describe('validate', () => {

    it('should return `{"success": false}` on missing field', () => {
      let testCase = Validator.validate({
        username: 'username'
      }, {
        username: Validator.UsernameField,
        password: Validator.PasswordField
      });
      expect(testCase.success).to.be.false;
      expect(testCase.err).to.have.lengthOf(1);
      expect(_.get(_.first(testCase.err), 'code')).to.equal(Error.Code.INVALID_PASSWORD_FORMAT);
    });

    it('should return `{"success": false}` on failed validation', () => {
      let testCase = Validator.validate({
        username: 'u',
        password: 'password',
      }, {
        username: Validator.UsernameField,
        password: Validator.PasswordField
      });
      expect(testCase.success).to.be.false;
      expect(testCase.err).to.have.lengthOf(2);
      expect(_.get(_.first(testCase.err), 'code')).to.be.oneOf([Error.Code.INVALID_PASSWORD_FORMAT, Error.Code.INVALID_USERNAME_FORMAT]);
      expect(_.get(_.last(testCase.err), 'code')).to.be.oneOf([Error.Code.INVALID_PASSWORD_FORMAT, Error.Code.INVALID_USERNAME_FORMAT]);
    });

    it('should return `{"success": false}` on partially failed validation', () => {
      let testCase = Validator.validate({
        username: 'u',
        password: 'password123'
      }, {
        username: Validator.UsernameField,
        password: Validator.PasswordField
      });
      expect(testCase.success).to.be.false;
      expect(testCase.err).to.have.lengthOf(1);
      expect(_.get(_.first(testCase.err), 'code')).to.equal(Error.Code.INVALID_USERNAME_FORMAT);
    });

    it('should return `{"success": true}` on empty object validation', () => {
      let testCase = Validator.validate({}, {});
      expect(testCase.success).to.be.true;
      expect(testCase.err).to.be.empty;
    });

    it('should return `{"success": true}` on successful validation', () => {
      let testCase = Validator.validate({
        username: 'username',
        password: 'password123'
      }, {
        username: Validator.UsernameField,
        password: Validator.PasswordField
      });
      expect(testCase.success).to.be.true;
      expect(testCase.err).to.be.empty;
    });
  });
});
