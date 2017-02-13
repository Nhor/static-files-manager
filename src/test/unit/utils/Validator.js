let _ = require('lodash');
let expect = require('chai').expect;
let Error = require('../../../utils/Error');
let Validator = require('../../../utils/Validator');

describe('Validator', () => {

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
