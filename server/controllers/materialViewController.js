const { sql } = require("../config/db");

// Get view history
const getMaterialViews = async (req, res) => {
    try {
        const result = await sql.query(`
            SELECT
                v.ViewID,
                v.MaterialID,
                m.Title AS MaterialTitle,
                v.UserID,
                u.FullName AS UserName,
                v.ViewedAt
            FROM MaterialViews v
            INNER JOIN Materials m
                ON v.MaterialID = m.MaterialID
            LEFT JOIN Users u
                ON v.UserID = u.UserID
            ORDER BY v.ViewID DESC
        `);

        res.json(result.recordset);
    } catch (error) {
        console.error("Get material views failed:", error);

        res.status(500).json({
            message: "Failed to get material views",
            error: error.message
        });
    }
};

// Create material view record
const createMaterialView = async (req, res) => {
    try {
        const {
            MaterialID
        } = req.body;

        const UserID = req.user.UserID;

        const result = await sql.query`
            INSERT INTO MaterialViews (
                MaterialID,
                UserID
            )
            OUTPUT
                INSERTED.ViewID,
                INSERTED.MaterialID,
                INSERTED.UserID,
                INSERTED.ViewedAt
            VALUES (
                ${MaterialID},
                ${UserID}
            )
        `;

        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error("Create material view failed:", error);

        res.status(500).json({
            message: "Failed to create material view",
            error: error.message
        });
    }
};

// Get views by material
const getMaterialViewsByMaterial = async (req, res) => {
    try {
        const { materialId } = req.params;

        const result = await sql.query`
            SELECT
                v.ViewID,
                v.MaterialID,
                m.Title AS MaterialTitle,
                v.UserID,
                u.FullName AS UserName,
                v.ViewedAt
            FROM MaterialViews v
            INNER JOIN Materials m
                ON v.MaterialID = m.MaterialID
            LEFT JOIN Users u
                ON v.UserID = u.UserID
            WHERE v.MaterialID = ${materialId}
            ORDER BY v.ViewID DESC
        `;

        res.json(result.recordset);
    } catch (error) {
        console.error("Get material views by material failed:", error);

        res.status(500).json({
            message: "Failed to get material views by material",
            error: error.message
        });
    }
};

module.exports = {
    getMaterialViews,
    createMaterialView,
    getMaterialViewsByMaterial
};