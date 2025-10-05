import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }

        const token = authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : authHeader;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }

        req.user = await User.findById(userId).select("-password");
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Not authorized" });
    }
};
