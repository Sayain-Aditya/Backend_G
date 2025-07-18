const express = require("express");
const { registerUser, loginUser,updateUser, getUserProfile } = require("../controllers/userController");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/update", updateUser);
router.get("/profile", getUserProfile);



module.exports = router;
