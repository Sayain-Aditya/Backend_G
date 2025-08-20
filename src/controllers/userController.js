// ✅ Server-side search for users, products, and orders
exports.search = async (req, res) => {
  try {
    const { type, query } = req.query;
    let results = [];
    if (!type || !query) {
      return res.status(400).json({ message: "Missing search type or query" });
    }
    const regex = new RegExp(query, "i");
    switch (type) {
      case "user":
        results = await User.find({
          $or: [
            { name: regex },
            { email: regex },
            { "address.fullName": regex },
            { "address.city": regex },
            { "address.state": regex },
          ],
        }).select("-password");
        break;
      case "product":
        results = await Product.find({
          $or: [
            { name: regex },
            { category: regex },
            { description: regex },
          ],
        });
        break;
      case "order":
        results = await Order.find({
          $or: [
            { status: regex },
            { "address.fullName": regex },
            { "address.city": regex },
            { "address.state": regex },
          ],
        }).populate("user", "name email").populate("items.product", "name price");
        break;
      default:
        return res.status(400).json({ message: "Invalid search type" });
    }
    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
require("dotenv").config();
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Order = require('../models/order');
const Product = require('../models/products');

// ✅ Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Enhanced Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Ensure connection before query
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token with extended expiry for Vercel
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role, 
        email: user.email
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '30d',
        notBefore: 0,
        issuer: 'grocery-app'
      }
    );

    // Return success response
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Logout user
exports.logoutUser = async (req, res) => {
  res.json({ message: "Logged out successfully" });
};

// ✅ Get logged-in user profile
exports.getUserProfile = async (req, res) => {
  try {
    // Mock user for now since no auth
    res.json({ id: "mock", name: "Test User", email: "test@test.com", role: "user" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// ✅ Update user profile
// ✅ Update user profile
exports.updateUser = async (req, res) => {
  try {
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const orders = await Order.find();

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    // Generate dummy monthly stats
    const monthlyStats = [
      { month: "Jan", orders: 5, revenue: 1500 },
      { month: "Feb", orders: 3, revenue: 800 },
      { month: "Mar", orders: 7, revenue: 2100 },
      { month: "Apr", orders: 4, revenue: 1200 },
    ];

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      monthlyStats,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats", error: err.message });
  }
};




