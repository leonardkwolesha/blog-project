import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const sign = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const safeUser = (u) => ({
  _id: u._id,
  email: u.email,
  username: u.username,
  imageUrl: u.imageUrl,
});

export const register = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    const normalEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalEmail });

    if (existing && existing.password) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 12);

    let user;
    if (existing) {
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
    return res.status(500).json({ success: false, message: "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.password)
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
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};
