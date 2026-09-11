const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getFavorites,
    getFavoritesByUser,
    createFavorite,
    deleteFavorite
} = require("../controllers/favoriteController");

// Get all favorites - Admin only
router.get("/", authMiddleware, adminMiddleware, getFavorites);

// Get favorites by user
router.get("/user/:userId", authMiddleware, getFavoritesByUser);

// Create favorite
router.post("/", authMiddleware, createFavorite);

// Delete favorite
router.delete("/:id", authMiddleware, deleteFavorite);

module.exports = router;