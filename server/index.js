const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

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

// CHANGED: serve the built React shop (the "dist" folder from `npm run build`)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Any other address (like /shop or /account) -> give React's page, React decides what to show
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});