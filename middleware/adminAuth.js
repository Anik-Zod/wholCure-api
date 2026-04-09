import jwt from "jsonwebtoken";

export const isAdminAuthenticated = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthenticated. Please login." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret');
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
};

export const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({ success: false, message: "Unauthenticated." });
        }
        if (!roles.includes(req.admin.role)) {
            return res.status(403).json({ success: false, message: `Access denied. Requires one of these roles: ${roles.join(", ")}` });
        }
        next();
    };
};

export const isSuperAdmin = (req, res, next) => {
    if (!req.admin || req.admin.role !== 'superadmin') {
        return res.status(403).json({ success: false, message: "Access denied. Super Admin privileges required." });
    }
    next();
};
