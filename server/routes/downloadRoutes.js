const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getDownloads,
    createDownload,
    getDownloadsByMaterial
} = require("../controllers/downloadController");

// Get all download history - Admin only
router.get("/", authMiddleware, adminMiddleware, getDownloads);

// Get downloads by material - Admin only
router.get("/material/:materialId", authMiddleware, adminMiddleware,getDownloadsByMaterial);

// Create download record
router.post("/", authMiddleware, createDownload);

module.exports = router;