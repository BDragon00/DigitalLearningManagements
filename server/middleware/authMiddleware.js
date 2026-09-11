const jwt = require("jsonwebtoken");

// Verify JWT token
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Access token is required"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Invalid authorization header"
            });
        }

        const decoded = jwt.verify(
            token,
            "digital-learning-secret-key"
        );

        req.user = decoded;

        next();
    } catch (error) {
        console.error("Authentication failed:", error);

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

module.exports = authMiddleware;