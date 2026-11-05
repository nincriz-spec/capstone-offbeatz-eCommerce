const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/register', userController.register);

router.post('/login', userController.login);

router.get('/me', authenticate, function (req, res) {
    res.json({ message: 'Retrieving Profile', user: req.user });
});

module.exports = router;