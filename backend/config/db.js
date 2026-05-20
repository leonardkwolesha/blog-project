// config/db.js
import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set in environment variables");
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);

    console.log(" Connected to Database successfully");
  } catch (error) {
    console.error(" Failed to connect to Database:", error.message);
    process.exit(1);
  }
};

export default connectDB;
