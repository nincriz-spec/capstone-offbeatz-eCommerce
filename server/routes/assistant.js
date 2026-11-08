const express = require('express');
const router = express.Router();
const assistantController = require('../controller/assistantController');

router.post('/chat', assistantController.chat);

module.exports = router;