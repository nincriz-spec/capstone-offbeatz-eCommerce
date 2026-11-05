const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/', authenticate, orderController.createOrder);

module.exports = router;