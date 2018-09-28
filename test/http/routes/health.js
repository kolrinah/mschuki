// health.js

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../../bin/www');

const expect = chai.expect;

chai.use(chaiHttp);

describe('HTTP Route tests', () => {
  describe('GET health', () => {
    after(done => server.close(done));

    it("should return 'true' for GET /health", (done) => {
      chai.request(server)
        .get('/health')
        .end((err, res) => { // when we get a response from the endpoint
          if (err) {
            throw err;
          }

          // the res object should have a status of 200
          expect(res.status).to.equal(200);

          // the property, res.body.state, we expect it to be true.
          expect(res.body).to.a('boolean');
          expect(res.body).to.be.true;

          // Finish the test
          server.stopConfig();
          done();
        });
    });
  });
});
