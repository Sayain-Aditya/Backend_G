const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/products', require('./src//routes/productRoutes'));
app.use('/api/cart', require('./src/routes/cartRoutes'));


// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));


// Export the app for Vercel
module.exports = app;
