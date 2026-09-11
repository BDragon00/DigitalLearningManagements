const express = require("express");
const router = express.Router();

const { getRoles } = require("../controllers/roleController");

// Get all roles
router.get("/", getRoles);

module.exports = router;