const { sql } = require("../config/db");

// Check permission to manage a material
const materialManageMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const { id } = req.params;

        // Admin can manage all materials
        if (req.user.RoleName === "Admin") {
            return next();
        }

        // Only Teacher can manage their own materials
        if (req.user.RoleName !== "Teacher") {
            return res.status(403).json({
                message: "You do not have permission to manage materials"
            });
        }

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
        console.error("Material permission check failed:", error);

        res.status(500).json({
            message: "Failed to check material permission",
            error: error.message
        });
    }
};

module.exports = materialManageMiddleware;