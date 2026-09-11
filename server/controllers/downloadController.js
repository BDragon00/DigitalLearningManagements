const { sql } = require("../config/db");

// Get download history
const getDownloads = async (req, res) => {
    try {
        const result = await sql.query(`
            SELECT
                d.DownloadID,
                d.MaterialID,
                m.Title AS MaterialTitle,
                d.UserID,
                u.FullName AS UserName,
                d.DownloadedAt
            FROM Downloads d
            INNER JOIN Materials m
                ON d.MaterialID = m.MaterialID
            INNER JOIN Users u
                ON d.UserID = u.UserID
            ORDER BY d.DownloadID DESC
        `);

        res.json(result.recordset);
    } catch (error) {
        console.error("Get downloads failed:", error);

        res.status(500).json({
            message: "Failed to get downloads",
            error: error.message
        });
    }
};

// Create download record
const createDownload = async (req, res) => {
    try {
        const {
            MaterialID
        } = req.body;

        const UserID = req.user.UserID;

        const result = await sql.query`
            INSERT INTO Downloads (
                MaterialID,
                UserID
            )
            OUTPUT
                INSERTED.DownloadID,
                INSERTED.MaterialID,
                INSERTED.UserID,
                INSERTED.DownloadedAt
            VALUES (
                ${MaterialID},
                ${UserID}
            )
        `;

        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error("Create download failed:", error);

        res.status(500).json({
            message: "Failed to create download record",
            error: error.message
        });
    }
};

// Get downloads by material
const getDownloadsByMaterial = async (req, res) => {
    try {
        const { materialId } = req.params;

        const result = await sql.query`
            SELECT
                d.DownloadID,
                d.MaterialID,
                m.Title AS MaterialTitle,
                d.UserID,
                u.FullName AS UserName,
                d.DownloadedAt
            FROM Downloads d
            INNER JOIN Materials m
                ON d.MaterialID = m.MaterialID
            INNER JOIN Users u
                ON d.UserID = u.UserID
            WHERE d.MaterialID = ${materialId}
            ORDER BY d.DownloadID DESC
        `;

        res.json(result.recordset);
    } catch (error) {
        console.error("Get downloads by material failed:", error);

        res.status(500).json({
            message: "Failed to get downloads by material",
            error: error.message
        });
    }
};

module.exports = {
    getDownloads,
    createDownload,
    getDownloadsByMaterial
};
  