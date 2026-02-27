import { auth } from "../lib/auth.js";

export const isAuthenticated = async (req, res, next) => {
    const session = await auth.api.getSession({
        headers: req.headers,
    });

    if (!session) {
        return res.status(401).json({
            success: false,
            message: "Authentication required. Please login first.",
        });
    }

    req.user = session.user;
    req.session = session.session;
    next();
};
