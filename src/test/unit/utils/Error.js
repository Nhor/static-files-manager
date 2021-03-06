const _ = require('lodash');
const expect = require('chai').expect;
const Error = require('../../../utils/Error');

describe('Error', () => {

  describe('InvalidFormat', () => {

    it('should create new error with given code', () => {
      let testCase = new Error.InvalidFormat(Error.Code.INVALID_USERNAME_FORMAT);
      expect(_.get(testCase, 'code')).to.equal(Error.Code.INVALID_USERNAME_FORMAT);
      expect(_.get(testCase, 'isCustom')).to.be.true;
    });
  });

  describe('InvalidValue', () => {

    it('should create new error with given code', () => {
      let testCase = new Error.InvalidValue(Error.Code.INVALID_PASSWORD);
      expect(_.get(testCase, 'code')).to.equal(Error.Code.INVALID_PASSWORD);
      expect(_.get(testCase, 'isCustom')).to.be.true;
    });
  });

  describe('RecordDoesNotExist', () => {

    it('should create new error with given code', () => {
      let testCase = new Error.RecordDoesNotExist(Error.Code.USER_NOT_FOUND);
      expect(_.get(testCase, 'code')).to.equal(Error.Code.USER_NOT_FOUND);
      expect(_.get(testCase, 'isCustom')).to.be.true;
    });
  });

  describe('RecordExists', () => {

    it('should create new error with given code', () => {
      let testCase = new Error.RecordExists(Error.Code.FILE_EXISTS);
      expect(_.get(testCase, 'code')).to.equal(Error.Code.FILE_EXISTS);
      expect(_.get(testCase, 'isCustom')).to.be.true;
    });
  });

  describe('Code', () => {

    it('each error code should be different', () => {
      let keys = _.keys(Error.Code);
      let values = _.values(Error.Code);
      expect(_.uniq(keys)).to.deep.equal(keys);
      expect(_.uniq(values)).to.deep.equal(values);
    });
  })
});
