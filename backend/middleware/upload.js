import multer from "multer";
import path from "path";
import multerCloudinary from "multer-storage-cloudinary";
const { CloudinaryStorage } = multerCloudinary;
import cloudinary from "../config/cloudinary.js";

// Check if Cloudinary is configured
const useCloudinary = !!cloudinary?.config()?.cloud_name;

let upload;

if (useCloudinary) {
  // Cloudinary storage
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "blog_images",
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      transformation: [{ width: 800, height: 800, crop: "limit" }],
    },
  });
  upload = multer({ storage });
} else {
  // Local storage fallback
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  upload = multer({ storage });
}

export default upload;
