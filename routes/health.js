// Health Route

const express = require('express');
const healthModule = require('../modules/health');

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags:
 *       - Health Check
 *     description: Returns true if the server is up
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns true if the server is up
 */
router.get('/', healthModule.routeHandler);

module.exports = router;
