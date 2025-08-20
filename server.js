const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { initializeSocket } = require('./src/services/socketService');

dotenv.config();
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);
const allowedOrigins = [
  "http://localhost:5173",
  "https://grocery-bay.vercel.app",
  "https://backend-g-gold.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      // Allow any vercel.app domain
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      
      // Allow specific origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    optionsSuccessStatus: 204,
  })
);
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Grocery App Backend API is running!' });
});

// Routes
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/cart', require('./src/routes/cartRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/delivery', require('./src/routes/deliveryRoutes'));

// MongoDB connection for Vercel serverless
mongoose.set('bufferCommands', true);

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  return mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/grocery', {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4
  });
};

connectDB().catch(console.error);

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// For local development
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export for Vercel
module.exports = app;
