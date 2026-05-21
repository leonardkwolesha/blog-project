import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { getCurrentUser, updateProfile, uploadAvatar, changePassword } from "../controller/user.controller.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/me", verifyToken, getCurrentUser);
router.put("/me", verifyToken, updateProfile);
router.post("/avatar", verifyToken, upload.single("avatar"), uploadAvatar);
router.put("/password", verifyToken, changePassword);

export default router;
