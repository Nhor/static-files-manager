let _ = require('lodash');
let expect = require('chai').expect;
let Error = require('../../../utils/Error');

describe('Error', () => {

  describe('InvalidFormat', () => {

    it('should create new error with given code', () => {
      let testCase = new Error.InvalidFormat(Error.Code.INVALID_USERNAME_FORMAT);
      expect(_.get(testCase, 'code')).to.equal(Error.Code.INVALID_USERNAME_FORMAT);
    });
  });

  describe('InvalidValue', () => {

    it('should create new error with given code', () => {
      let testCase = new Error.InvalidValue(Error.Code.INVALID_PASSWORD);
      expect(_.get(testCase, 'code')).to.equal(Error.Code.INVALID_PASSWORD);
    });
  });

  describe('RecordDoesNotExist', () => {

    it('should create new error with given code', () => {
      let testCase = new Error.RecordDoesNotExist(Error.Code.USER_NOT_FOUND);
      expect(_.get(testCase, 'code')).to.equal(Error.Code.USER_NOT_FOUND);
    });
  });
});
