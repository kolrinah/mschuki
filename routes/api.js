// Api Route

const express = require('express');

const router = express.Router();

const statusRoute = require('../modules/status/status.routes');

router.use('/status', statusRoute);

module.exports = router;

