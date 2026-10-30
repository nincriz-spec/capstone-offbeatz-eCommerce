const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const pool = require('./database');

// Middleware
app.use(express.json());

app.use(cors());

// Routes
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the API" });
});

const productsRouter = require('./routes/products');
app.use('/api/products', productsRouter);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});