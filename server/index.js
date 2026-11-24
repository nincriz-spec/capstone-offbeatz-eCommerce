const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const logger = require('./logger');
const { loginLimiter } = require('./rateLimiters');

const app = express();
const pool = require('./database');


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.set('trust proxy', 1);


app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cors());


app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
   
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


app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,                                
      sameSite: 'lax',                               
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 1000 * 60 * 60,                       
    },
  })
);


app.use('/api/users/login', loginLimiter);



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


const dashboardRouter = require('./routes/dashboard');
app.use('/dashboard', dashboardRouter);


const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));


app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});


app.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl.split('?')[0]} - ${err.message}`);
  res.status(500).json({ error: 'Something went wrong' });
});


process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled rejection: ${reason}`);
});
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught exception: ${err.stack}`);
  process.exit(1);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});