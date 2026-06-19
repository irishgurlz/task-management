import prisma from "../lib/prisma.js";

const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Akses ditolak"
            });
        }
        next();
    };
};


export default roleMiddleware;