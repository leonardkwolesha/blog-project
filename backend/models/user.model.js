// models/user.model.js

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent model overwrite errors in development
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;