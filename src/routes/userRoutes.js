const express = require("express");
const {
  registerUser,
  loginUser,
  updateUser,
  getUserProfile,
  getAdminStats,
  search
} = require("../controllers/userController");
const { protect } = require('../middleware/authMiddleware');

// Admin middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

const router = express.Router();

// ✅ PUBLIC ROUTES
router.post("/register", registerUser);
router.post("/login", loginUser);

// ✅ PROTECTED ROUTES
router.put("/update", protect, updateUser);
router.get("/me", protect, getUserProfile);

// ✅ SEARCH ROUTE
router.get('/search', protect, search);

router.get('/stats', protect, adminOnly, getAdminStats);

module.exports = router;
