import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import fs from "fs";
import path from "path";
import connectDB from "./config/db.js";
import authRouter from "./router/auth.router.js";
import userRoutes from "./router/user.router.js";
import blogRouter from "./router/BlogPost.router.js";
import contactRouter from "./router/contact.router.js";
import cloudinary from "./config/cloudinary.js";

const app = express();
const PORT = process.env.PORT || 2030;

// ── Database ────────────────────────────────────────────────────────────────
connectDB();

// ── Local uploads folder ─────────────────────────────────────────────────────
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow server-to-server / curl / Postman (no origin header)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      // reject silently — do NOT throw, that crashes Express error handler
      return cb(null, false);
    },
    credentials: true,
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many messages sent. Please wait before trying again." },
});

app.use("/api", apiLimiter);
app.use("/api/contact", contactLimiter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.json({ message: "Server up and running" });
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/users", userRoutes);
app.use("/api/blogs", blogRouter);
app.use("/api/contact", contactRouter);

// ── Local uploads fallback ───────────────────────────────────────────────────
if (!cloudinary?.config()?.cloud_name) {
  app.use("/uploads", express.static(uploadsDir));
  console.log("Serving local uploads from /uploads");
} else {
  console.log("Using Cloudinary for image uploads");
}

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ success: false, message: err.message || "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
