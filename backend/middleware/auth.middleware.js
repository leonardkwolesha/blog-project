import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ success: false, message: "Unauthorized: no token provided" });

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });

    if (!payload.userId || !mongoose.Types.ObjectId.isValid(payload.userId))
      return res.status(401).json({ success: false, message: "Unauthorized: invalid token payload" });

    req.userId = payload.userId;
    next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Unauthorized: session has expired, please log in again"
        : "Unauthorized: invalid token";
    return res.status(401).json({ success: false, message });
  }
};
