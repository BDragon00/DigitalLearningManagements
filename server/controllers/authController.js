const jwt = require("jsonwebtoken");
const { sql } = require("../config/db");
const bcrypt = require("bcryptjs");

// Login
const login = async (req, res) => {
    try {
        const { Email, Password } = req.body;

        const result = await sql.query`
            SELECT
                u.UserID,
                u.FullName,
                u.Email,
                u.PasswordHash,
                u.RoleID,
                r.RoleName
            FROM Users u
            INNER JOIN Roles r
                ON u.RoleID = r.RoleID
            WHERE u.Email = ${Email}
        `;

        if (result.recordset.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = result.recordset[0];

        const isPasswordValid = await bcrypt.compare(
            Password,
            user.PasswordHash
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
        {
            UserID: user.UserID,
            RoleID: user.RoleID,
            RoleName: user.RoleName
        },
            "digital-learning-secret-key",
        {
            expiresIn: "1d"
        }
    );

        res.json({
            message: "Login successful",
            token,
            user: {
                UserID: user.UserID,
                FullName: user.FullName,
                Email: user.Email,
                RoleID: user.RoleID,
                RoleName: user.RoleName
            }
        });
    } catch (error) {
        console.error("Login failed:", error);

        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
};

// Get current authenticated user
const getCurrentUser = async (req, res) => {
    try {
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
            WHERE u.UserID = ${req.user.UserID}
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error("Get current user failed:", error);

        res.status(500).json({
            message: "Failed to get current user",
            error: error.message
        });
    }
};

module.exports = {
    login,
    getCurrentUser
};
