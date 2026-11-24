const rateLimit = require('express-rate-limit');

const FIFTEEN_MINUTES = 15 * 60 * 1000;


const loginLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
});


const dashboardLoginLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  handler: (req, res) => {
    res.status(429).render('dashboard/login', {
      title: 'Admin Login',
      error: 'Too many login attempts. Please try again in 15 minutes.',
    });
  },
});

module.exports = { loginLimiter, dashboardLoginLimiter };