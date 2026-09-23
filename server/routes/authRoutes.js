const express = require("express");
const router = express.Router();

const {
    login,
    getCurrentUser,
    changePassword,
    getSecurityQuestion,
    resetPassword
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// Login
router.post("/login", login);

// Get current authenticated user
router.get("/me", authMiddleware, getCurrentUser);

// Change own password
router.put("/change-password", authMiddleware, changePassword);

// Forgot password flow (public, no auth required)
router.get("/security-question", getSecurityQuestion);
router.put("/reset-password", resetPassword);

module.exports = router;