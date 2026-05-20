import User from "../models/user.model.js";

export const syncUser = async (req, res) => {
  try {
    const clerkUserId = req.userId;

    if (!clerkUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // User data comes from the frontend (SyncUser.jsx sends it in the body)
    const { email, username, imageUrl } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required for sync" });
    }

    let user = await User.findOne({ clerkId: clerkUserId });

    if (user) {
      // Update existing record
      if (username) user.username = username;
      if (imageUrl) user.imageUrl = imageUrl;
      if (email)    user.email    = email;
      await user.save();
    } else {
      // Try finding by email (handles re-registration edge cases)
      user = await User.findOne({ email });

      if (user) {
        user.clerkId   = clerkUserId;
        if (username)  user.username  = username;
        if (imageUrl)  user.imageUrl  = imageUrl;
        await user.save();
      } else {
        user = await User.create({
          clerkId:  clerkUserId,
          email:    email,
          username: username || email.split("@")[0],
          imageUrl: imageUrl || "",
        });
      }
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("syncUser error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
