// health.js
// Health module unit tests

const sinon = require('sinon');
const chai = require('chai');

const expect = chai.expect;

const healthModule = require('../../../modules/health');

describe('Health Module Unit Tests', () => {
  describe('checkHealth()', () => {
    it('should be true', () => {
      const result = healthModule.checkHealth();
      expect(result).to.a('boolean');
      expect(result).to.be.true;
    });
  });

  describe('GET health routehandler', () => {
    it('should respond', () => {
      let req; 

      const status = sinon.stub();
      const json = sinon.spy();
      const res = { json, status };
      status.returns(res);

      healthModule.routeHandler(req, res);
      expect(json.calledOnce).to.equal(true);
    });
  });
});
