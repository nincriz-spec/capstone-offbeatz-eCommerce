const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

router.get('/orders', authenticate, isAdmin, adminController.getAllOrders);
router.put('/orders/:id/status', authenticate, isAdmin, adminController.updateOrderStatus);

module.exports = router;