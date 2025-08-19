const User = require("../models/user");

// Session-based authentication middleware
exports.protect = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const user = await User.findById(req.session.userId).select("-password");
    
    if (!user) {
      req.session.destroy();
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
