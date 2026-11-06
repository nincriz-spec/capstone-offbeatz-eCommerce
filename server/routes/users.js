const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/register', userController.register);

router.post('/login', userController.login);

router.get('/me', authenticate, userController.getProfile);
router.put('/me', authenticate, userController.updateProfile);

router.get('/addresses', authenticate, userController.getAddresses);
router.post('/addresses', authenticate, userController.addAddress);
router.put('/addresses/:id', authenticate, userController.updateAddress);
router.delete('/addresses/:id', authenticate, userController.removeAddress);

module.exports = router;