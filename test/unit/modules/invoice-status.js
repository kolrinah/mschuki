const axios = require('axios');
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const statusModule = require('../../../modules/status');
const chai = require('chai');

const expect = chai.expect;


/*eslint max-len: ["error", { "code": 200 }]*/

describe('Invoice - Status Module Route Unit Tests', () => {
    describe('get invoice  status', () => {
        let sandbox;

        let invoice = 123;
        const date = new Date().toJSON().slice(0, 10);
        const phone = '4044444444';
        const store = 10;

        beforeEach(() => {
            sandbox = sinon.sandbox.create();
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('data validation and error message', done => {
            sandbox.stub(axios, 'post').returns(Promise.resolve({ data: {
                        status: {
                            status: false,
                            message: 'error',
                            description: 'child "invoiceNumber" fails because ["invoiceNumber" must be larger than or equal to 400000]'
                        },
                        data: {}
                    }
                }
            ));


            //743263
            const request = httpMocks.createRequest({
                method: 'GET',
                url: `/invoice/${invoice}/date/${date}/phone/${phone}/store/${store}`,
                params: {
                    invoice,
                    date,
                    phone,
                    store
                }
            });

            const response = httpMocks.createResponse({
                eventEmitter: require('events').EventEmitter
            });

            statusModule.index(request, response);

            response.on('end', () => {
                const responseData = JSON.parse(response._getData());

                expect(responseData.status).to.equal(false);
                expect(responseData.message).to.equal('error');
                expect(responseData.description.indexOf('invoiceNumber') > -1).to.equal(true);

                done();
            });
        });


        it('success message', done => {
            sandbox.stub(axios, 'post').returns(Promise.resolve({ data:
                    {
                        status: {
                            status: false,
                            message: 'error',
                            description: 'Error getting status: Cannot retrieve requested order'
                        },
                        data: {}
                    }
            }));


            invoice = 400000;

            const request = httpMocks.createRequest({
                method: 'GET',
                url: `/invoice/${invoice}/date/${date}/phone/${phone}/store/${store}`,
                params: {
                    invoice,
                    date,
                    phone,
                    store
                }
            });

            const response = httpMocks.createResponse({
                eventEmitter: require('events').EventEmitter
            });

            statusModule.index(request, response);

            response.on('end', () => {
                const responseData = JSON.parse(response._getData());

                expect(responseData.status).to.equal(false);
                expect(responseData.message).to.equal('error');
                expect(responseData.description.indexOf('Cannot retrieve requested order') > -1).to.equal(true);

                done();
            });
        });
    });
});
