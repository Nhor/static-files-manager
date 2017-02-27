const expect = require('chai').expect;
const request = require('request');
const Config = require('../../../Config');
const Error = require('../../../utils/Error');

describe('ErrorCode', () => {

  describe('GET', () => {

    it('should respond with success for valid data', done => {
      let options = {
        json: true,
        method: 'GET',
        url: `http://localhost:${Config.port}/api/error-code`
      };
      request(options, (err, res, body) => {
        expect(res.statusCode).to.equal(200);
        expect(body.errorCode).to.deep.equal(Error.Code);
        done();
      });
    });
  });
});
