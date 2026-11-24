const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const adminService = require('../services/adminService');
const logger = require('../logger');

function showLogin(req, res) {
  if (req.session.admin) {
    return res.redirect('/dashboard');
  }
  res.render('dashboard/login', { title: 'Admin Login', error: null });
}

async function login(req, res) {
  try {
    const { email, password } = req.body;


    const { token } = await userService.loginUser(email, password);

   
    const payload = jwt.decode(token);
    if (payload.role !== 'admin') {
      throw new Error('This account is not an admin');
    }

    const profile = await userService.getProfile(payload.customerId);

   
    req.session.regenerate((err) => {
      if (err) {
        logger.error(`admin session regenerate failed: ${err.message}`);
        return res.status(500).render('dashboard/login', {
          title: 'Admin Login',
          error: 'Something went wrong. Please try again.',
        });
      }
      req.session.admin = { customerId: payload.customerId, name: profile.name };
      res.redirect('/dashboard');
    });
  } catch (err) {
    res.status(401).render('dashboard/login', {
      title: 'Admin Login',
      error: err.message,
    });
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/dashboard/login');
  });
}

function showHome(req, res) {
  res.render('dashboard/home', { title: 'Dashboard', admin: req.session.admin });
}

async function showOrders(req, res) {
  try {
    
    const filters = {
      status: req.query.status,
      search: req.query.search,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
    };

    const orders = await adminService.getAllOrders(filters);

    
    const values = {
      status: typeof filters.status === 'string' ? filters.status : '',
      search: typeof filters.search === 'string' ? filters.search : '',
      fromDate: typeof filters.fromDate === 'string' ? filters.fromDate : '',
      toDate: typeof filters.toDate === 'string' ? filters.toDate : '',
    };


    const flash = req.session.flash || null;
    delete req.session.flash;

    res.render('dashboard/orders', {
      title: 'Orders',
      admin: req.session.admin,
      orders,
      allowedNext: adminService.allowedNext,
      values,
      flash,
    });
  } catch (err) {
    logger.error(`dashboard showOrders failed: ${err.message}`);
    res.status(500).send('Could not load orders');
  }
}

async function changeOrderStatus(req, res) {
  const orderId = Number(req.params.id);
  const newStatus = req.body.status;

  try {
    if (!Number.isInteger(orderId)) {
      throw new Error('Invalid order id');
    }
    await adminService.updateOrderStatus(req.session.admin.customerId, orderId, newStatus);
    req.session.flash = { type: 'success', text: 'Order #' + orderId + ' is now ' + newStatus };
  } catch (err) {
    req.session.flash = { type: 'danger', text: err.message };
  }

  res.redirect('/dashboard/orders');
}

module.exports = { showLogin, login, logout, showHome, showOrders, changeOrderStatus };