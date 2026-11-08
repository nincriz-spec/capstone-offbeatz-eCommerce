const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/dashboardController');

// Only let someone in if the session says they are an admin
function requireAdminSession(req, res, next) {
  if (!req.session.admin) {
    return res.redirect('/dashboard/login');
  }
  next();
}

router.get('/login', dashboardController.showLogin);
router.post('/login', dashboardController.login);
router.post('/logout', requireAdminSession, dashboardController.logout);
router.get('/', requireAdminSession, dashboardController.showHome);

router.get('/orders', requireAdminSession, dashboardController.showOrders);
router.post('/orders/:id/status', requireAdminSession, dashboardController.changeOrderStatus);

module.exports = router;