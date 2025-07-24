const express = require("express");
const {
  registerUser,
  loginUser,
  updateUser,
  getUserProfile
} = require("../controllers/userController");
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ PUBLIC ROUTES
router.post("/register", registerUser);
router.post("/login", loginUser);

// ✅ PROTECTED ROUTES
router.put("/update", protect, updateUser);
router.get("/me", protect, getUserProfile);

module.exports = router;
