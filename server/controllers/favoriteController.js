const { sql } = require("../config/db");

// Get favorite materials
const getFavorites = async (req, res) => {
    try {
        const result = await sql.query(`
            SELECT
                f.FavoriteID,
                f.MaterialID,
                m.Title AS MaterialTitle,
                f.UserID,
                u.FullName AS UserName,
                f.CreatedAt
            FROM Favorites f
            INNER JOIN Materials m
                ON f.MaterialID = m.MaterialID
            INNER JOIN Users u
                ON f.UserID = u.UserID
            ORDER BY f.FavoriteID DESC
        `);

        res.json(result.recordset);
    } catch (error) {
        console.error("Get favorites failed:", error);

        res.status(500).json({
            message: "Failed to get favorites",
            error: error.message
        });
    }
};

// Create favorite
const createFavorite = async (req, res) => {
    try {
        const {
            MaterialID
        } = req.body;

        const UserID = req.user.UserID;

        const result = await sql.query`
            INSERT INTO Favorites (
                MaterialID,
                UserID
            )
            OUTPUT
                INSERTED.FavoriteID,
                INSERTED.MaterialID,
                INSERTED.UserID,
                INSERTED.CreatedAt
            VALUES (
                ${MaterialID},
                ${UserID}
            )
        `;

        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error("Create favorite failed:", error);

        res.status(500).json({
            message: "Failed to create favorite",
            error: error.message
        });
    }
};

// Delete favorite
const deleteFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const UserID = req.user.UserID;

        const result = await sql.query`
            DELETE FROM Favorites
            OUTPUT
                DELETED.FavoriteID,
                DELETED.MaterialID,
                DELETED.UserID
            WHERE FavoriteID = ${id}
              AND UserID = ${UserID}
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Favorite not found or you do not have permission to delete it"
            });
        }

        res.json({
            message: "Favorite deleted successfully",
            favorite: result.recordset[0]
        });
    } catch (error) {
        console.error("Delete favorite failed:", error);

        res.status(500).json({
            message: "Failed to delete favorite",
            error: error.message
        });
    }
};

// Get favorites by user
const getFavoritesByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const UserID = req.user.UserID;
        const RoleName = req.user.RoleName;

        // Admin can view favorites of any user
        if (RoleName !== "Admin" && String(UserID) !== String(userId)) {
            return res.status(403).json({
                message: "You can only view your own favorites"
            });
        }

        const result = await sql.query`
            SELECT
                f.FavoriteID,
                f.MaterialID,
                m.Title AS MaterialTitle,
                m.Description,
                m.FileName,
                m.FileType,
                m.FileSize,
                f.UserID,
                f.CreatedAt
            FROM Favorites f
            INNER JOIN Materials m
                ON f.MaterialID = m.MaterialID
            WHERE f.UserID = ${userId}
            ORDER BY f.FavoriteID DESC
        `;

        res.json(result.recordset);
    } catch (error) {
        console.error("Get favorites by user failed:", error);

        res.status(500).json({
            message: "Failed to get favorites by user",
            error: error.message
        });
    }
};

module.exports = {
    getFavorites,
    createFavorite,
    deleteFavorite,
    getFavoritesByUser
};