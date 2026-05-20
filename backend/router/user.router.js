import express from "express";
import { verifyClerkToken } from "../middleware/clerkAuth.middleware.js";
import { getCurrentUser, updateProfile, uploadAvatar, changePassword } from "../controller/user.controller.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/me", verifyClerkToken, getCurrentUser);
router.put("/me", verifyClerkToken, updateProfile);
router.post("/avatar", verifyClerkToken, upload.single("avatar"), uploadAvatar);
router.put("/password", verifyClerkToken, changePassword);

export default router;
