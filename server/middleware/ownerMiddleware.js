const { sql } = require("../config/db");

// Check whether the logged-in user owns the material
const ownerMiddleware = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await sql.query`
            SELECT UploadedBy
            FROM Materials
            WHERE MaterialID = ${id}
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Material not found"
            });
        }

        const material = result.recordset[0];

        if (String(material.UploadedBy) !== String(req.user.UserID)) {
            return res.status(403).json({
                message: "You can only manage your own materials"
            });
        }

        next();
    } catch (error) {
        console.error("Owner check failed:", error);

        res.status(500).json({
            message: "Failed to check material ownership",
            error: error.message
        });
    }
};

module.exports = ownerMiddleware;