import mongoose from "mongoose";

// Drop indexes left over from removed schema fields so they can no longer
// block writes. Safe to call repeatedly — missing indexes are ignored.
const dropLegacyIndexes = async () => {
  const db = mongoose.connection.db;
  const stale = [
    { col: "users",     idx: "clerkId_1"      },
    { col: "blogposts", idx: "authorClerkId_1" },
  ];
  for (const { col, idx } of stale) {
    try {
      await db.collection(col).dropIndex(idx);
      console.log(`Dropped legacy index: ${col}.${idx}`);
    } catch {
      // Index not found or collection doesn't exist yet — nothing to do
    }
  }
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set in environment variables");
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log("Connected to Database successfully");
    await dropLegacyIndexes();
  } catch (error) {
    console.error("Failed to connect to Database:", error.message);
    process.exit(1);
  }
};

export default connectDB;
