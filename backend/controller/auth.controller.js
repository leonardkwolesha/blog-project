import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { sendResetEmail, canSendEmail } from "../config/email.js";

const sign = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: "7d" });

const safeUser = (u) => ({
  _id: u._id,
  email: u.email,
  username: u.username,
  imageUrl: u.imageUrl,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });
    if (!EMAIL_RE.test(email.trim()))
      return res.status(400).json({ success: false, message: "Enter a valid email address" });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    const normalEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalEmail });

    // Already registered with a real password — reject
    if (existing?.password?.length > 0) {
      return res.status(409).json({ success: false, message: "An account with this email already exists. Please log in." });
    }

    const hashed = await bcrypt.hash(password, 12);

    let user;
    if (existing) {
      // Email exists but never had a password set — complete the account
      existing.password = hashed;
      if (username?.trim()) existing.username = username.trim();
      await existing.save();
      user = existing;
    } else {
      user = await User.create({
        email: normalEmail,
        password: hashed,
        username: username?.trim() || normalEmail.split("@")[0],
      });
    }

    return res.status(201).json({
      success: true,
      token: sign(user._id.toString()),
      user: safeUser(user),
    });
  } catch (err) {
    console.error("Register error:", err.message);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      if (field === "email")
        return res.status(409).json({ success: false, message: "An account with this email already exists. Please log in." });
      return res.status(500).json({ success: false, message: "Registration failed. Please try again." });
    }
    if (err.name === "MongooseError" || err.name === "MongoNetworkError" || err.message?.includes("connect"))
      return res.status(503).json({ success: false, message: "Service temporarily unavailable. Please try again shortly." });
    return res.status(500).json({ success: false, message: "Registration failed. Please try again." });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always respond with success to avoid email enumeration — but ANY registered
    // user (with or without a password) can receive a reset link
    if (!user) {
      return res.status(200).json({ success: true, message: "If that email exists, a reset link has been sent." });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashed  = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetToken       = hashed;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Pick the production HTTPS frontend URL; fall back to localhost for dev
    const allUrls    = (process.env.FRONTEND_URL || "http://localhost:5173").split(",").map((u) => u.trim());
    const frontendUrl = allUrls.find((u) => u.startsWith("https://")) || allUrls[0];
    const resetUrl   = `${frontendUrl}/reset-password?token=${rawToken}`;

    if (!canSendEmail()) {
      // Email not configured — log to console so devs can still test the flow
      console.warn("⚠️  EMAIL_USER / EMAIL_PASS not set. Password reset URL (dev only):");
      console.warn("   ", resetUrl);
      return res.status(200).json({ success: true, message: "If that email exists, a reset link has been sent." });
    }

    await sendResetEmail(user.email, resetUrl);

    return res.status(200).json({ success: true, message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err.message);
    const isSmtpErr =
      err.code === "ECONNECTION" ||
      err.code === "ETIMEDOUT"   ||
      err.code === "EAUTH"       ||
      (typeof err.responseCode === "number" && err.responseCode >= 500);
    const message = isSmtpErr
      ? "Could not reach the email server. Please try again in a moment."
      : "Failed to send reset email. Try again later.";
    return res.status(500).json({ success: false, message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ success: false, message: "Token and new password are required" });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetToken: hashed,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user)
      return res.status(400).json({ success: false, message: "Reset link is invalid or has expired." });

    user.password         = await bcrypt.hash(newPassword, 12);
    user.resetToken       = null;
    user.resetTokenExpiry = null;
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err.message);
    return res.status(500).json({ success: false, message: "Reset failed. Try again." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.password?.length)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    return res.status(200).json({
      success: true,
      token: sign(user._id.toString()),
      user: safeUser(user),
    });
  } catch (err) {
    console.error("Login error:", err.message);
    if (err.name === "MongooseError" || err.name === "MongoNetworkError" || err.message?.includes("connect"))
      return res.status(503).json({ success: false, message: "Service temporarily unavailable. Please try again shortly." });
    return res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
};
