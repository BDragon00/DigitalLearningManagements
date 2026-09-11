const { sql } = require("../config/db");

const getRoles = async (req, res) => {
    try {
        const result = await sql.query(`
            SELECT
                RoleID,
                RoleName,
                Description
            FROM Roles
            ORDER BY RoleID
        `);

        res.json(result.recordset);
    } catch (error) {
        console.error("Get roles failed:", error);

        res.status(500).json({
            message: "Failed to get roles",
            error: error.message
        });
    }
};

module.exports = {
    getRoles
};