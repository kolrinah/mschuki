'use strict';

const axios = require('axios');
const config = require('@omni-config');
const logger = require('../log/winston');

exports.status = function (invoiceNumber, storeNumber, invoiceDate, phone) {
    const _config = {
        url: `${config.settings.hosts.asapi}/ecommerce/orders/status`,
        headers: { Authorization: `Chupi${config.settings.app.asapiAuthKey}` },
        data: {
            invoiceNumber,
            storeNumber,
            invoiceDate,
            lastName: '',
            phone
        }
    };

    logger.info(_config);
    
    return axios.post(_config.url, _config.data, {
        headers: _config.headers
    });
};

exports.details = function (invoice,
                            date,
                            store
                            ) {
    const _config = {
        url: `${config.settings.hosts.asapi}/invoice/${invoice}`,
        headers: { Authorization: `Chupi${config.settings.app.asapiAuthKey}` },
        params: {
            date,
            store,
            comments: false,
            paymentHistory: false,
            deliveryHistory: false,
            multiScheduleOptions: false,
            skuAvailability: true
        }
    };

    logger.info(_config);

    return axios.get(_config.url, _config);
};

