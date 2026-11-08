const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const adminService = require('../services/adminService');

function showLogin(req, res) {
  if (req.session.admin) {
    return res.redirect('/dashboard');
  }
  res.render('dashboard/login', { title: 'Admin Login', error: null });
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Reuse the same login the customers use (checks email + password)
    const { token } = await userService.loginUser(email, password);

    // Open the token to read the role (we just made it ourselves, so we trust it)
    const payload = jwt.decode(token);
    if (payload.role !== 'admin') {
      throw new Error('This account is not an admin');
    }

    const profile = await userService.getProfile(payload.customerId);

    // New session id on login (session security)
    req.session.regenerate((err) => {
      if (err) {
        console.error(err);
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
    const orders = await adminService.getAllOrders();

    // A one-time message (like "Order updated"), then we forget it
    const flash = req.session.flash || null;
    delete req.session.flash;

    res.render('dashboard/orders', {
      title: 'Orders',
      admin: req.session.admin,
      orders,
      allowedNext: adminService.allowedNext,
      flash,
    });
  } catch (err) {
    console.error(err);
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

  // Redirect after saving, like the teacher's sample
  res.redirect('/dashboard/orders');
}

module.exports = { showLogin, login, logout, showHome, showOrders, changeOrderStatus };