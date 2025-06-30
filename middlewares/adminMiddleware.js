import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";

export const isAdminAuthenticated = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.split(" ")[1] || req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Admin authentication required",
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({
        message: "Invalid admin token",
        success: false,
      });
    }
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(403).json({
        message: "Admin access required",
        success: false,
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    // console.error("Admin authentication error:", error);
    return res.status(500).json({
      message: "Server error during admin authentication",
      success: false,
    });
  }
};
