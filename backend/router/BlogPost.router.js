import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  createBlogPost,
  getAllBlogPosts,
  getBlogPostById,
  updateBlogPost,
  deleteBlogPost,
  searchBlogs,
  getStats,
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

// Middleware: verify the authenticated user exists in the database
const ensureUserExists = async (req, res, next) => {
  try {
    if (!req.userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { default: User } = await import("../models/user.model.js");
    const user = await User.findById(req.userId);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found. Please register first." });

    req.user = user;
    next();
  } catch (err) {
    console.error("ensureUserExists error:", err);
    return res.status(500).json({ success: false, message: "Error verifying user" });
  }
};

// ── Routes ──────────────────────────────────────────────
router.post(  "/create",  verifyToken, ensureUserExists, upload.single("image"), createBlogPost);
router.get(   "/search",  searchBlogs);
router.get(   "/stats",   getStats);       // must be before /:id
router.get(   "/",        getAllBlogPosts);
router.get(   "/:id",     getBlogPostById);
router.put(   "/:id",     verifyToken, ensureUserExists, upload.single("image"), updateBlogPost);
router.delete("/:id",     verifyToken, ensureUserExists, deleteBlogPost);

export default router;
