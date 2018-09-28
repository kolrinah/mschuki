const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Invoice Microservice', info: 'This is the Invoice microservice.' }); 
});

module.exports = router;
