const { sql } = require("../config/db");
const bcrypt = require("bcryptjs");

// Get all users
const getUsers = async (req, res) => {
    try {
        const result = await sql.query(`
            SELECT
                UserID,
                FullName,
                Email,
                RoleID,
                CreatedAt
            FROM Users
            ORDER BY UserID DESC
        `);

        res.json(result.recordset);
    } catch (error) {
        console.error("Get users failed:", error);

        res.status(500).json({
            message: "Failed to get users",
            error: error.message
        });
    }
};

// Create user
const createUser = async (req, res) => {
    try {
        const {
            FullName,
            Email,
            PasswordHash,
            SecurityQuestion,
            SecurityAnswer
        } = req.body;

        const hashedPassword = await bcrypt.hash(PasswordHash, 10);
        const hashedAnswer = SecurityAnswer
            ? await bcrypt.hash(SecurityAnswer.trim().toLowerCase(), 10)
            : null;

        // Public registration can only create Student accounts
        const RoleID = 1;

        const result = await sql.query`
            INSERT INTO Users (
                FullName,
                Email,
                PasswordHash,
                RoleID,
                SecurityQuestion,
                SecurityAnswerHash
            )
            OUTPUT
                INSERTED.UserID,
                INSERTED.FullName,
                INSERTED.Email,
                INSERTED.RoleID,
                INSERTED.CreatedAt
            VALUES (
                ${FullName},
                ${Email},
                ${hashedPassword},
                ${RoleID},
                ${SecurityQuestion || null},
                ${hashedAnswer}
            )
        `;

        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error("Create user failed:", error);

        res.status(500).json({
            message: "Failed to create user",
            error: error.message
        });
    }
};

// Get users by role
const getUsersByRole = async (req, res) => {
    try {
        const { roleId } = req.params;

        const result = await sql.query`
            SELECT
                u.UserID,
                u.FullName,
                u.Email,
                u.RoleID,
                r.RoleName,
                u.CreatedAt
            FROM Users u
            INNER JOIN Roles r
                ON u.RoleID = r.RoleID
            WHERE u.RoleID = ${roleId}
            ORDER BY u.UserID DESC
        `;

        res.json(result.recordset);
    } catch (error) {
        console.error("Get users by role failed:", error);

        res.status(500).json({
            message: "Failed to get users by role",
            error: error.message
        });
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        // Admin can view any user
        if (
            req.user.RoleName !== "Admin" &&
            String(req.user.UserID) !== String(id)
        ) {
            return res.status(403).json({
                message: "You can only view your own profile"
            });
        }

        const result = await sql.query`
            SELECT
                u.UserID,
                u.FullName,
                u.Email,
                u.RoleID,
                r.RoleName,
                u.CreatedAt
            FROM Users u
            INNER JOIN Roles r
                ON u.RoleID = r.RoleID
            WHERE u.UserID = ${id}
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error("Get user by ID failed:", error);

        res.status(500).json({
            message: "Failed to get user",
            error: error.message
        });
    }
};

// Update user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            FullName,
            Email,
            RoleID
        } = req.body;

        const result = await sql.query`
            UPDATE Users
            SET
                FullName = COALESCE(${FullName}, FullName),
                Email = COALESCE(${Email}, Email),
                RoleID = COALESCE(${RoleID}, RoleID)
            OUTPUT
                INSERTED.UserID,
                INSERTED.FullName,
                INSERTED.Email,
                INSERTED.RoleID,
                INSERTED.CreatedAt
            WHERE UserID = ${id}
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error("Update user failed:", error);

        res.status(500).json({
            message: "Failed to update user",
            error: error.message
        });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check whether the user owns any materials
        const materialResult = await sql.query`
            SELECT COUNT(*) AS MaterialCount
            FROM Materials
            WHERE UploadedBy = ${id}
        `;

        const materialCount = materialResult.recordset[0].MaterialCount;

        if (materialCount > 0) {
            return res.status(400).json({
                message: "Cannot delete user because this user owns materials",
                MaterialCount: materialCount
            });
        }

        // Delete related user data
        await sql.query`
            DELETE FROM Downloads
            WHERE UserID = ${id}
        `;

        await sql.query`
            DELETE FROM Favorites
            WHERE UserID = ${id}
        `;

        await sql.query`
            DELETE FROM MaterialViews
            WHERE UserID = ${id}
        `;

        // Delete user
        const result = await sql.query`
            DELETE FROM Users
            OUTPUT
                DELETED.UserID,
                DELETED.FullName,
                DELETED.Email
            WHERE UserID = ${id}
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "User deleted successfully",
            user: result.recordset[0]
        });
    } catch (error) {
        console.error("Delete user failed:", error);

        res.status(500).json({
            message: "Failed to delete user",
            error: error.message
        });
    }
};

module.exports = {
    getUsers,
    getUsersByRole,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};