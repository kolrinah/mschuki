'use strict';
const moment = require('moment');

const asapiConnector = require('../../connectors/Asapi');
const logger = require('../../log/winston');

const NotAvailable = 'Not Available';

const SPECIAL_SKU_NUMBERS = ['3380020', '3380021', '209996', '209997'];

const parse = function (data) {
    const parsed = {};
    Object.keys(data).forEach((attr) => {
        const value = data[attr];
        parsed[attr] = (!value || value === 'null' || value === 'undefined') ? '' : value;
    });
    return parsed;
};

const getDisposition = function (data) {
    return data.products[0].disposition;
};

const getDispositionDescription = function (data) {
    let description = '';
    switch (getDisposition(data)) {
        case 'D':
            description = 'premiumDelivery';
            break;
        case 'F':
            description = 'freeShipping';
            break;
        case 'W':
            description = 'pickup';
            break;
        case 'T':
            description = 'taken';
            break;
        default:
            description = '';
    }
    return description;
};

const getSchedule = function (data) {
    return {
        date: moment(data.schedule.date).format('YYYY-MM-DD'),
        timeWindow: data.schedule.timeWindow,
    };
};

const getReceiptDayOptions = function (data) {
    const minDates = [];
    const topDate = moment().add(120, 'days');
    const products = getOpenProducts(data);
    products.forEach((product) => {
        let minDate = topDate;
        if (product.availabilityDates !== undefined) {
            product.availabilityDates.forEach((availableDate) => {
                const avDate = moment(availableDate.date);
                if ((parseInt(availableDate.quantity, 10) > 0) && (avDate < minDate)) {
                    minDate = avDate;
                }
            });
        }
        if (topDate === minDate) {
            minDates.push(NotAvailable);
        } else {
            minDates.push(minDate.format('YYYY-MM-DD'));
        }
    });
    return minDates;
};

const getRecommendedReceptionDate = function (data) {
    const minDates = getReceiptDayOptions(data);
    let maxDate = moment();
    minDates.forEach(minDate => {
        const minMoment = moment(minDate);
        if ((minDate !== NotAvailable) && (minMoment > maxDate)) {
            maxDate = minMoment;
        }
    });
    return maxDate.format('YYYY-MM-DD');
};

const isFreeShipping = function (data) {
    return !!((getDisposition(data) === 'F' && !data.serviceCharges.serviceAmount > 0));
};

const getProducts = function (data) {
    return data.products.filter(product => {
        return !SPECIAL_SKU_NUMBERS.includes(product.skuNumber);
    });
};

const getOpenProducts = function (data) {
    return data.productsOpen.filter(product => {
        return !SPECIAL_SKU_NUMBERS.includes(product.skuNumber);
    });
};

const getItemStatus = (product, data) => {
    const today = new moment();
    const { disposition, openQuantity, reservedQuantity } = product;
    let scheduledDate;
    if (data.schedule instanceof Array) {
        scheduledDate = data.schedule[0].date;
    } else {
        scheduledDate = data.schedule.date;
    }
    const { route } = data.schedule;
    const ItemStatus = {
        ReadyForPickup: 'readyForPickup',
        NotScheduled: 'notScheduled',
        OutForDelivery: 'outForDelivery',
        Delivered: 'delivered',
        PickedUp: 'pickedUp',
        NotReserved: 'notReserved',
        Scheduled: 'scheduled'
    };
    if (parseInt(reservedQuantity, 10) < parseInt(openQuantity, 10)) {
        return ItemStatus.NotReserved;
    } else if (scheduledDate === '0') {
        return ItemStatus.NotScheduled;
    } else if (scheduledDate !== '0') {
        return ItemStatus.Scheduled;
    }

    if (disposition === 'D') {
        if (today.isSame(moment(scheduledDate)) && route) {
            return ItemStatus.OutForDelivery;
        } else if (openQuantity === '0') {
            return ItemStatus.Delivered;
        }
    } else if (disposition === 'W') {
        if (today.isSame(moment(scheduledDate))) {
            return ItemStatus.ReadyForPickup;
        } else if (openQuantity === '0') {
            return ItemStatus.PickedUp;
        }
    }
};

const getOrderItems = function (data) {
    return getProducts(data).map(product => {
        return {
            itemStatus: getItemStatus(product, data),
            skuNumber: product.skuNumber,
            skuDescription: product.skuDescription,
            disposition: product.disposition,
            deliveryMethod: product.dispositionDescription,
            openQuantity: product.openQuantity,
            orderedQuantity: product.orderedQuantity,
            actions: (parseInt(product.deliveryDate, 10) !== 0) ? 'submitClaim' : 'schedule',
            imageUri: product.imageUrl,
            unitPrice: product.unitPrice,
            totalPrice: product.totalPrice,
            isAvailable: (parseInt(product.availableQuantity, 10) >= parseInt(product.openQuantity, 10)),
            nextAvailableDate: product.nextAvailableDate
        };
    });
};

const getDeliveryAddress = function (data) {
    let deliveryAddress = [];
    data.addresses.forEach((address) => {
        if (address.addressType === 'D') { deliveryAddress = address; }
    });
    return deliveryAddress;
};

const invoiceDetailsDate = function (data, status) {
    logger.info('invoiceDetailsDate', data);
    return {
        status,
        order: {
            customerId: data.customerId,
            allowScheduling: data.allowScheduling,
            zipCode: getDeliveryAddress(data).zip,
            salesAssociates: data.transactionDetails.salesAssociates,
            invoiceNumber: data.transactionNumber, // data.transactionNumber
            totalInvoiceAmount: data.transactionDetails.totalAmount,
            serviceCharges: data.serviceCharges,
            disposition: getDispositionDescription(data),
            schedule: getSchedule(data),
            isFreeShipping: isFreeShipping(data), // if disposition == F && deliveryCharge == 0
            /**
             * recommendedReceiptDate:
             *    First day where all items are available in order for pickup or delivery
             */
            recommendedReceiptDate: getRecommendedReceptionDate(data),
            /**
             * receiptDayOptions:
             *  First day where any item is available and 30 days in the future
             */
            receiptDayOptions: getReceiptDayOptions(data), //Array<string>, //date string of any ISO format (pickup and Delivery)
            orderItems: getOrderItems(data), //Array<OrderItem>,
            storeNumber: data.storeNumber
        }
    };
};

exports.index = function (req, res) {
    const data = parse(req.params);

    const invoiceNumber = data.invoice || 0;
    const storeNumber = data.store || 10;
    const invoiceDate = data.date || new Date().toJSON().slice(0, 10);
    const phone = data.phone || '';

    asapiConnector.status(invoiceNumber, storeNumber, invoiceDate, phone).then(response => {
        if (response.data.status.status) {
            if (response.data.data && response.data.data.transactionDetails) {
                asapiConnector.details(invoiceNumber, invoiceDate, storeNumber)

                    .then(details => {
                        if (details.data.status.status && details.data.data.transactionNumber) {
                            return res.status(200).json(invoiceDetailsDate(details.data.data, details.data.status));
                        }

                        return res.status(500).json({
                            status: false,
                            message: 'error',
                            description: 'invoice details no data' });
                        }, (error) => {
                            return res.status(500).json(error.response.data);
                        })

                    .catch(error => {
                        logger.error('invoice details error', error.message);
                        return res.status(500).json(error.message);
                    });
            } else {
                logger.error('order status no data', response.data);

                return res.status(500).json({ status: false, message: 'error', description: 'order status no data' });
            }
        } else {
            logger.error('order status', response.data.status);
            return res.status(500).json(response.data.status);
        }
    })

    .catch((error) => {
        logger.error('error', error);
        return res.status(500).json(error);
    });
};
