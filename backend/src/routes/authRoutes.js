
const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// Registration
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Protected profile
router.get("/me", protect, getMe);

module.exports = router;
