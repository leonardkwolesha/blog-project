import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      default: null,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    resetToken: {
      type: String,
      default: null,
      index: true,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;