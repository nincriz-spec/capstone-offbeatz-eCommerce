const express = require('express');
const crypto = require('crypto');
const fileUpload = require('express-fileupload');
const router = express.Router();
const dashboardController = require('../controller/dashboardController');
const productController = require('../controller/dashboardProductController');
const { dashboardLoginLimiter } = require('../rateLimiters');

// Makes a secret token for this session and shares it with every page
function csrfSetup(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
}

// On every POST, the token in the form must match the one in the session
function csrfCheck(req, res, next) {
  const sent = String((req.body && req.body._csrf) || '');
  const real = req.session.csrfToken || '';
  const ok = sent.length === real.length && crypto.timingSafeEqual(Buffer.from(sent), Buffer.from(real));
  if (!ok) {
    return res.status(403).send('Invalid CSRF token');
  }
  next();
}

// Only let someone in if the session says they are an admin
function requireAdminSession(req, res, next) {
  if (!req.session.admin) {
    return res.redirect('/dashboard/login');
  }
  next();
}

router.use(csrfSetup);

router.get('/login', dashboardController.showLogin);
router.post('/login', dashboardLoginLimiter, csrfCheck, dashboardController.login);
router.post('/logout', requireAdminSession, csrfCheck, dashboardController.logout);
router.get('/', requireAdminSession, dashboardController.showHome);

router.get('/orders', requireAdminSession, dashboardController.showOrders);
router.post('/orders/:id/status', requireAdminSession, csrfCheck, dashboardController.changeOrderStatus);

router.get('/products', requireAdminSession, productController.showProducts);
router.get('/products/new', requireAdminSession, productController.showNewForm);
router.post('/products', requireAdminSession, csrfCheck, productController.createProduct);
router.get('/products/:id/edit', requireAdminSession, productController.showEditForm);
router.post('/products/:id', requireAdminSession, csrfCheck, productController.updateProduct);
router.post('/products/:id/active', requireAdminSession, csrfCheck, productController.toggleActive);

// File upload: only admins, max 5 MB. fileUpload runs BEFORE csrfCheck
// because it is what reads the form (including the hidden _csrf field).
router.post(
  '/products/:id/pdf',
  requireAdminSession,
  fileUpload({ limits: { fileSize: 5 * 1024 * 1024 } }),
  csrfCheck,
  productController.uploadPdf
);

module.exports = router;