// router/user.router.js

import express from "express";
import { verifyClerkToken } from "../middleware/clerkAuth.middleware.js";
import {
  syncUser,
  getCurrentUser,
  getProfile,
} from "../controller/user.controller.js";

const router = express.Router();

router.post("/sync",    verifyClerkToken, syncUser);
router.get("/me",       verifyClerkToken, getCurrentUser);
router.get("/profile",  verifyClerkToken, getProfile);

export default router;