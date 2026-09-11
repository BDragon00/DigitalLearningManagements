const teacherMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    if (req.user.RoleName !== "Teacher") {
        return res.status(403).json({
            message: "Teacher access required"
        });
    }

    next();
};

module.exports = teacherMiddleware;