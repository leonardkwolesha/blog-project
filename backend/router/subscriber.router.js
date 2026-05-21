import express from "express";
import rateLimit from "express-rate-limit";
import { subscribe, unsubscribe, unsubscribeInline } from "../controller/subscriber.controller.js";

const router = express.Router();

const subscribeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many subscription attempts. Please wait before trying again." },
});

router.post(  "/",           subscribeLimiter, subscribe);
router.get(   "/unsubscribe", unsubscribe);        // email link → branded HTML page
router.delete("/",            unsubscribeInline);  // in-page button → JSON response

export default router;
