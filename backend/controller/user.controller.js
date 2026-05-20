import bcrypt from "bcrypt";
import cloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, imageUrl } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (username?.trim()) user.username = username.trim();
    if (imageUrl !== undefined) user.imageUrl = imageUrl;

    await user.save();
    return res.status(200).json({
      success: true,
      data: { _id: user._id, email: user.email, username: user.username, imageUrl: user.imageUrl },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file provided" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const b64     = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    const result  = await cloudinary.uploader.upload(dataURI, {
      folder: "blog_avatars",
      transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }],
    });
    const imageUrl = result.secure_url;

    user.imageUrl = imageUrl;
    await user.save();
    return res.status(200).json({
      success: true,
      data: { _id: user._id, email: user.email, username: user.username, imageUrl },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: "Current and new password are required" });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const match = await bcrypt.compare(currentPassword, user.password || "");
    if (!match) return res.status(401).json({ success: false, message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    return res.status(200).json({ success: true, message: "Password updated" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
