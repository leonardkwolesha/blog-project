import dotenv from "dotenv";
dotenv.config(); // must run before reading process.env

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const { cloud_name } = cloudinary.config();

if (cloud_name) {
  console.log(`☁️  Cloudinary ready — cloud: ${cloud_name}`);
} else {
  console.warn("⚠️  Cloudinary not configured. Images will be stored locally.");
}

export default cloudinary;
