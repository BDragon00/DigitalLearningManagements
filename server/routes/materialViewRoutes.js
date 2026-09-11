const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getMaterialViews,
    createMaterialView,
    getMaterialViewsByMaterial,
} = require("../controllers/materialViewController");

// Get view history - Admin only
router.get("/", authMiddleware, adminMiddleware, getMaterialViews);

// Get views by material ID - Admin only
router.get("/material/:materialId", authMiddleware, adminMiddleware, getMaterialViewsByMaterial);

// Create material view record
router.post("/", authMiddleware, createMaterialView);

module.exports = router;