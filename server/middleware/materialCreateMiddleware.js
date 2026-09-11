const materialCreateMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    if (
        req.user.RoleName !== "Admin" &&
        req.user.RoleName !== "Teacher"
    ) {
        return res.status(403).json({
            message: "You do not have permission to upload materials"
        });
    }

    next();
};

module.exports = materialCreateMiddleware;