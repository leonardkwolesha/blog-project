import { getAuth } from "@clerk/express";

// clerkMiddleware() in index.js validates the RS256 signature automatically.
// This middleware just checks the resulting auth state and sets req.userId.
export const verifyClerkToken = (req, res, next) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized: valid token required" });
  }
  req.userId = userId;
  next();
};
