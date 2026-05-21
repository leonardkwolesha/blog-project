import express from "express";
import rateLimit from "express-rate-limit";
import { getComments, addComment } from "../controller/comment.controller.js";

const router = express.Router();

const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min window
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many comments. Please wait a moment before trying again." },
});

router.get( "/:postId", getComments);
router.post("/:postId", commentLimiter, addComment);

export default router;
