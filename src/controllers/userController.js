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
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }
    if (address) {
      user.address = { ...user.address, ...address };
    }

    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
exports.getAdminStats = async (req, res) => {
  try {
    // Return mock data for Vercel deployment
    const mockStats = {
      totalUsers: 25,
      totalProducts: 45,
      totalOrders: 18,
      totalRevenue: 12500,
      monthlyStats: [
        { month: "Jan", orders: 5, revenue: 2500 },
        { month: "Feb", orders: 3, revenue: 1800 },
        { month: "Mar", orders: 7, revenue: 4200 },
        { month: "Apr", orders: 3, revenue: 4000 },
      ],
    };

    res.json(mockStats);
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ message: "Error fetching stats", error: err.message });
  }
};




