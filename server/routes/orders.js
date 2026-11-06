const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/', authenticate, orderController.createOrder);
router.get('/', authenticate, orderController.getOrders);
router.put('/:id/cancel', authenticate, orderController.cancelOrder);

module.exports = router;