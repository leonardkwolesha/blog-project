import express from "express";
import { verifyClerkToken } from "../middleware/clerkAuth.middleware.js";
import { getCurrentUser, updateProfile, changePassword } from "../controller/user.controller.js";

const router = express.Router();

router.get("/me", verifyClerkToken, getCurrentUser);
router.put("/me", verifyClerkToken, updateProfile);
router.put("/password", verifyClerkToken, changePassword);

export default router;
