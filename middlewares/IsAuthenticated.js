import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import Admin from "../models/admin.model.js";
import blacklistTokenModel from "../models/blacklistToken.model.js";

export const IsAuthenticated = async (req, res, next) => {
  try {

    const token = req?.headers?.authorization?.split(" ")[1] || req.cookies.token;
    console.log(req?.headers?.authorization)
    if (!token) {
      return res.status(401).json({ message: "You are not authenticated." });
    }
    // const isBlacklisted = await BlacklistToken.findOne({ token });
    // if (isBlacklisted) {
    //   return res.status(401).json({ message: "🚫 Token is blacklisted. Please login again." });
    // }

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    if (!decode) {
      return res.status(401).json({ message: "Invalid token." });
    }

    const user =
      (await UserModel.findById(decode.id)) || Admin.findById(decode._id);
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    req.user = user;
    if (user.role === "admin") {
      const adminFind = await Admin.findById(user._id);
      req.admin = adminFind;
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default IsAuthenticated;
