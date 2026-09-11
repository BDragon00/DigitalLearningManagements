const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const express = require("express");
const router = express.Router();

const {
    getUsers,
    getUsersByRole,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} = require("../controllers/userController");

// Get all users
router.get("/", authMiddleware, adminMiddleware, getUsers);

// Get users by role
router.get("/role/:roleId", authMiddleware, adminMiddleware, getUsersByRole);

// Get user by ID
router.get("/:id", authMiddleware, getUserById);

// Update user
router.put("/:id", authMiddleware, adminMiddleware, updateUser);

// Delete user
router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);

// Create user
router.post("/", createUser);

module.exports = router;