// app.js

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../bin/www');

const expect = chai.expect;

chai.use(chaiHttp);

describe('HTTP App tests', () => {
  after(done => server.close(done));

  it('should return something when we hit the index', (done) => {
    chai.request(server)
      .get('/')
      .end((err, res) => { // when we get a response from the endpoint
        if (err) {
          throw err;
        }

        // the res object should have a status of 200
        expect(res.status).to.equal(200);

        // Finish the test
        done();
      });
  });
});
