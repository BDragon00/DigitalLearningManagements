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

// Change password (self-service)
const changePassword = async (req, res) => {
    try {
        const { CurrentPassword, NewPassword } = req.body;

        const result = await sql.query`
            SELECT UserID, PasswordHash
            FROM Users
            WHERE UserID = ${req.user.UserID}
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = result.recordset[0];

        const isCurrentValid = await bcrypt.compare(
            CurrentPassword,
            user.PasswordHash
        );

        if (!isCurrentValid) {
            return res.status(401).json({
                message: "Current password is incorrect"
            });
        }

        const hashedPassword = await bcrypt.hash(NewPassword, 10);

        await sql.query`
            UPDATE Users
            SET PasswordHash = ${hashedPassword}
            WHERE UserID = ${req.user.UserID}
        `;

        res.json({
            message: "Password changed successfully"
        });
    } catch (error) {
        console.error("Change password failed:", error);

        res.status(500).json({
            message: "Failed to change password",
            error: error.message
        });
    }
};

// Get the security question for an email (forgot-password flow, step 1)
const getSecurityQuestion = async (req, res) => {
    try {
        const { email } = req.query;

        const result = await sql.query`
            SELECT SecurityQuestion
            FROM Users
            WHERE Email = ${email}
        `;

        if (
            result.recordset.length === 0 ||
            !result.recordset[0].SecurityQuestion
        ) {
            return res.status(404).json({
                message: "No security question set up for this email"
            });
        }

        res.json({
            SecurityQuestion: result.recordset[0].SecurityQuestion
        });
    } catch (error) {
        console.error("Get security question failed:", error);

        res.status(500).json({
            message: "Failed to get security question",
            error: error.message
        });
    }
};

// Reset password using the security question answer (forgot-password flow, step 2)
const resetPassword = async (req, res) => {
    try {
        const { Email, SecurityAnswer, NewPassword } = req.body;

        const result = await sql.query`
            SELECT UserID, SecurityAnswerHash
            FROM Users
            WHERE Email = ${Email}
        `;

        if (
            result.recordset.length === 0 ||
            !result.recordset[0].SecurityAnswerHash
        ) {
            return res.status(404).json({
                message: "No security question set up for this email"
            });
        }

        const user = result.recordset[0];

        const isAnswerValid = await bcrypt.compare(
            SecurityAnswer.trim().toLowerCase(),
            user.SecurityAnswerHash
        );

        if (!isAnswerValid) {
            return res.status(401).json({
                message: "Incorrect answer"
            });
        }

        const hashedPassword = await bcrypt.hash(NewPassword, 10);

        await sql.query`
            UPDATE Users
            SET PasswordHash = ${hashedPassword}
            WHERE UserID = ${user.UserID}
        `;

        res.json({
            message: "Password reset successfully"
        });
    } catch (error) {
        console.error("Reset password failed:", error);

        res.status(500).json({
            message: "Failed to reset password",
            error: error.message
        });
    }
};

module.exports = {
    login,
    getCurrentUser,
    changePassword,
    getSecurityQuestion,
    resetPassword
};