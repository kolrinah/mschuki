'use strict';

const express = require('express');

const routes = express.Router();

const index = require('./index');


/**
 * @swagger
 * paths:
 *  /api/v1/status/invoice/{invoice}/date/{date}/phone/{phone}/store/{store}:
 *   get:
 *     summary: Gets the sku quantities, the transaction info, and the delivery charges for the requested invoice
 *     parameters:
 *      - name: invoice
 *        in: path
 *        description: invoice number
 *        required: true
 *        type: integer
 *
 *      - name: date
 *        in: path
 *        description: invoice creation date
 *        required: true
 *        type: string
 *
 *      - name: phone
 *        in: path
 *        description: customer's phone
 *        required: false
 *        type: string
 *
 *      - name: store
 *        in: path
 *        description: store number where the invoice was create
 *        required: false
 *        type: integer
 *
 *     responses:
 *       '500':
 *          description : Error message when request failed
 *          content:
 *           application/json:
 *
 *       '200':
 *          description : Response when validation
 *          content:
 *           application/json:
 *
 */
routes.get('/invoice/:invoice' +
            '/date/:date' +
            '/phone/:phone?' +
            '/store/:store?', index.index);


module.exports = routes;
