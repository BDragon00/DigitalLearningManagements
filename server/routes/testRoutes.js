const express = require("express");
const router = express.Router();

const { sql } = require("../config/db");

router.get("/test-db", async (req, res) => {
    try {
        const result = await sql.query("SELECT TOP 5 * FROM Roles");

        res.json(result.recordset);
    } catch (error) {
        console.error("Database query failed:", error);

        res.status(500).json({
            message: "Database query failed",
            error: error.message
        });
    }
});

module.exports = router;