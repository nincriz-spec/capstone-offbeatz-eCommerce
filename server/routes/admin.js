const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');
const fileUpload = require('express-fileupload');
const pdfController = require('../controller/pdfController');

router.get('/orders', authenticate, isAdmin, adminController.getAllOrders);
router.put('/orders/:id/status', authenticate, isAdmin, adminController.updateOrderStatus);
router.post('/products/:id/pdf', authenticate, isAdmin, fileUpload({ limits: { fileSize: 5 * 1024 * 1024 } }), pdfController.uploadPdf);

module.exports = router;