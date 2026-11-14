const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const logger = require('./logger');
const { loginLimiter } = require('./rateLimiters');

const app = express();
const pool = require('./database');

// Tell Express to use EJS, and where the pages (views) live
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Codespaces and hosting sites sit behind a proxy, so trust it
app.set('trust proxy', 1);

// Middleware
app.use(express.json());
// Lets the server read normal HTML form posts (the EJS login form)
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// Log every API and dashboard request: method, path, status and how long it took.
// We never log the body or the query, so passwords and tokens stay out of the file.
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    // originalUrl is the full address; we cut off anything after "?" so no query text is logged
    const fullPath = req.originalUrl.split('?')[0];
    if (fullPath.startsWith('/api') || fullPath.startsWith('/dashboard')) {
      const ms = Date.now() - start;
      const message = `${req.method} ${fullPath} ${res.statusCode} ${ms}ms`;
      if (res.statusCode >= 500) logger.error(message);
      else if (res.statusCode >= 400) logger.warn(message);
      else logger.info(message);
    }
  });
  next();
});

// Session = the server's memory of who is logged in (used by the dashboard)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,                                // JavaScript in the browser cannot read it
      sameSite: 'lax',                               // helps block other sites from using it
      secure: process.env.NODE_ENV === 'production', // https only when deployed
      maxAge: 1000 * 60 * 60,                        // 1 hour
    },
  })
);

// Rate limit on the shop login
app.use('/api/users/login', loginLimiter);

// Routes
// The shop (React) now answers at '/', see the bottom of this file.

const productsRouter = require('./routes/products');
const usersRouter = require('./routes/users');
app.use('/api/products', productsRouter);
app.use('/api/users', usersRouter);

const ordersRouter = require('./routes/orders');
app.use('/api/orders', ordersRouter);

const adminRouter = require('./routes/admin');
app.use('/api/admin', adminRouter);

const assistantRouter = require('./routes/assistant');
app.use('/api/assistant', assistantRouter);

// Admin dashboard (EJS pages)
const dashboardRouter = require('./routes/dashboard');
app.use('/dashboard', dashboardRouter);

// Serve the built React shop (the "dist" folder from `npm run build`)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Any other address (like /shop or /account) -> give React's page, React decides what to show
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Last stop for errors: write them to the log and send a safe message
// (it must have 4 parameters, that is how Express knows it is an error handler)
app.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl.split('?')[0]} - ${err.message}`);
  res.status(500).json({ error: 'Something went wrong' });
});

// Errors that nobody caught: log them instead of failing silently
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled rejection: ${reason}`);
});
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught exception: ${err.stack}`);
  process.exit(1);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});