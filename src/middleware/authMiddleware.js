const jwt = require("jsonwebtoken");
const User = require("../models/user");

// 🔐 Middleware: Verify and decode token, attach user to req
exports.protect = async (req, res, next) => {
  console.log("Auth middleware triggered");
  console.log("Headers:", req.headers.authorization);
  
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No valid auth header");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token extracted:", token ? "Token exists" : "No token");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      clockTolerance: 300, // Allow 5 minutes clock skew for Vercel
      ignoreExpiration: false,
      ignoreNotBefore: false
    });
    console.log("Token decoded:", decoded);
    
    const user = await User.findById(decoded.id).select("-password");
    console.log("User found:", user ? user._id : "No user");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    console.log("req.user set:", req.user._id);
    next();
  } catch (err) {
    console.log("Token verification failed:", err.message);
    return res.status(401).json({
      message: "Invalid or expired token",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
