const express = require('express');
const router = express.Router();

// require invoke.js
const invoke = require('../victorychain/invoke');
const query = require('../victorychain/query');

// user routes
router.post('/create', invoke.createProduct);
router.post('/change-owner', invoke.changeProductOwner);
router.get('/products', query.getAllProducts);
router.get('/product/:serialNumber', query.getProduct);

module.exports = router;