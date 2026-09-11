const authMiddleware = require("../middleware/authMiddleware");
const materialManageMiddleware = require("../middleware/materialManageMiddleware");
const materialCreateMiddleware = require("../middleware/materialCreateMiddleware");
const express = require("express");
const router = express.Router();

const {
    getMaterials,
    getMaterialById,
    searchMaterials,
    getMaterialsByCategory,
    getMaterialsByUser,
    getMaterialDownloadCount,
    getMaterialViewCount,
    getMaterialFavoriteCount,
    getMaterialStatistics,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    downloadMaterial
} = require("../controllers/materialController");

const upload = require("../middleware/uploadMiddleware");

// Get all materials
router.get("/", getMaterials);

// Search materials
router.get("/search", searchMaterials);

// Get materials by category
router.get("/category/:categoryId", getMaterialsByCategory);

// Get materials by user
router.get("/user/:userId", getMaterialsByUser);

// Get material download count
router.get("/:id/download-count", getMaterialDownloadCount);

// Get material views count
router.get("/:id/views", getMaterialViewCount);

// Get material favorite count
router.get("/:id/favorite-count", getMaterialFavoriteCount);

// Get material statistics
router.get("/:id/statistics", getMaterialStatistics);

// Download material file
router.get("/:id/download", authMiddleware, downloadMaterial);

// Get material by ID
router.get("/:id", getMaterialById);

// Create material
router.post("/", authMiddleware, materialCreateMiddleware, upload.single("file"), createMaterial);

// Update material
router.put("/:id", authMiddleware, materialManageMiddleware, updateMaterial);

// Delete material
router.delete("/:id", authMiddleware, materialManageMiddleware, deleteMaterial);

module.exports = router;