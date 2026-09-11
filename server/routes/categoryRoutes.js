const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

// Get all categories
router.get("/", getCategories);

// Get category by ID
router.get("/:id", getCategoryById);

// Create category - Admin only
router.post("/", authMiddleware, adminMiddleware, createCategory);

// Update category - Admin only
router.put("/:id", authMiddleware, adminMiddleware, updateCategory);

// Delete category - Admin only
router.delete("/:id", authMiddleware, adminMiddleware, deleteCategory);

module.exports = router;