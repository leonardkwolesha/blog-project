import express from "express";
import multer from "multer";
import { verifyClerkToken } from "../middleware/clerkAuth.middleware.js";
import {
  createBlogPost,
  getAllBlogPosts,
  getBlogPostById,
  updateBlogPost,
  deleteBlogPost,
  searchBlogs,
} from "../controller/BlogPost.controller.js";

const router = express.Router();

// Store file in memory — the controller decides Cloudinary vs local
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB cap
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
  },
});

// Middleware: ensure the Clerk user is synced to MongoDB
const ensureUserExists = async (req, res, next) => {
  try {
    if (!req.userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { default: User } = await import("../models/User.model.js");
    const user = await User.findOne({ clerkId: req.userId });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found. Please sync your account first." });

    req.user = user;
    next();
  } catch (err) {
    console.error("ensureUserExists error:", err);
    return res.status(500).json({ success: false, message: "Error verifying user" });
  }
};

// ── Routes ──────────────────────────────────────────────
router.post(  "/create",  verifyClerkToken, ensureUserExists, upload.single("image"), createBlogPost);
router.get(   "/search",  searchBlogs);
router.get(   "/",        getAllBlogPosts);
router.get(   "/:id",     getBlogPostById);
router.put(   "/:id",     verifyClerkToken, ensureUserExists, upload.single("image"), updateBlogPost);
router.delete("/:id",     verifyClerkToken, ensureUserExists, deleteBlogPost);

export default router;
