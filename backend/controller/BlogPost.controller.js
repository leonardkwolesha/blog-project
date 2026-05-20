import { Readable } from "stream";
import fs from "fs/promises";
import path from "path";
import cloudinary from "../config/cloudinary.js";
import BlogPost from "../models/BlogPost.model.js";

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Detect backend host for local uploads
const getFullImageUrl = (imagePath, req) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http") || imagePath.startsWith("https")) return imagePath;
  const host = req ? `${req.protocol}://${req.get("host")}` : "";
  return `${host}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

// Upload buffer to Cloudinary or fall back to local disk
const uploadImage = (buffer, originalname) => {
  if (cloudinary.config().cloud_name) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "blog_images", transformation: [{ width: 1200, crop: "limit" }] },
        (err, result) => (err ? reject(err) : resolve(result.secure_url))
      );
      Readable.from(buffer).pipe(stream);
    });
  }
  // Local fallback
  const filename = `${Date.now()}${path.extname(originalname || ".jpg")}`;
  const filepath = path.join(process.cwd(), "uploads", filename);
  return fs.writeFile(filepath, buffer).then(() => `/uploads/${filename}`);
};

// ==============================
// CREATE BLOG POST
// ==============================
export const createBlogPost = async (req, res) => {
  try {
    const user = req.user;
    const clerkUserId = req.userId;
    const { title, content, description, category, tags, published, imageUrl } = req.body;

    if (!title || !content)
      return res.status(400).json({ success: false, message: "Title and content are required" });

    let finalImageUrl = "";
    if (req.file) {
      finalImageUrl = await uploadImage(req.file.buffer, req.file.originalname);
    } else if (imageUrl) {
      finalImageUrl = imageUrl;
    }

    const newBlog = await BlogPost.create({
      title,
      content,
      description: description || "",
      category: category || "Uncategorized",
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim())) : [],
      image: finalImageUrl,
      author: user._id,
      authorClerkId: clerkUserId,
      published: published !== undefined ? published : true,
    });

    await newBlog.populate("author", "username email imageUrl");

    // Prepend local host URL if needed
    const blogObj = newBlog.toObject();
    blogObj.image = getFullImageUrl(blogObj.image, req);

    return res.status(201).json({
      success: true,
      message: "Blog post created successfully",
      blog: blogObj,
    });
  } catch (error) {
    console.error("Create blog error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create blog post",
      error: error.message,
    });
  }
};

// ==============================
// UPDATE BLOG POST
// ==============================
export const updateBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const { title, content, description, category, tags, published, imageUrl } = req.body;

    const blog = await BlogPost.findById(id);
    if (!blog || blog.isDeleted) return res.status(404).json({ success: false, message: "Blog post not found" });
    if (!blog.author?.equals(user._id)) return res.status(403).json({ success: false, message: "Forbidden" });

    if (title) blog.title = title;
    if (content) blog.content = content;
    if (description) blog.description = description;
    if (category) blog.category = category;
    if (tags) blog.tags = Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim());
    if (published !== undefined) blog.published = published;

    if (req.file) {
      blog.image = await uploadImage(req.file.buffer, req.file.originalname);
    } else if (imageUrl) {
      blog.image = imageUrl;
    }

    await blog.save();

    const blogObj = blog.toObject();
    blogObj.image = getFullImageUrl(blogObj.image, req);

    return res.status(200).json({
      success: true,
      message: "Blog post updated successfully",
      blog: blogObj,
    });
  } catch (error) {
    console.error("Update blog error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update blog post",
      error: error.message,
    });
  }
};

// ==============================
// GET ALL BLOG POSTS
// ==============================
export const getAllBlogPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag, search, sortBy = "createdAt", order = "desc" } = req.query;

    const query = { isDeleted: false };
    if (category) query.category = category;
    if (tag) query.tags = { $in: [tag] };
    if (search) {
      const safe = escapeRegex(search.slice(0, 200));
      query.$or = [
        { title: { $regex: safe, $options: "i" } },
        { content: { $regex: safe, $options: "i" } },
        { description: { $regex: safe, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: order === "desc" ? -1 : 1 };

    const blogs = await BlogPost.find(query)
      .populate("author", "username email imageUrl")
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await BlogPost.countDocuments(query);

    // Prepend host to local images
    const blogsWithFullUrl = blogs.map(blog => {
      const b = blog.toObject();
      b.image = getFullImageUrl(b.image, req);
      return b;
    });

    return res.status(200).json({
      success: true,
      blogs: blogsWithFullUrl,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get all blogs error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blog posts",
      error: error.message,
    });
  }
};

// ==============================
// GET SINGLE BLOG POST BY ID
// ==============================
export const getBlogPostById = async (req, res) => {
  try {
    const blog = await BlogPost.findById(req.params.id).populate("author", "username email imageUrl firstName lastName");
    if (!blog || blog.isDeleted) return res.status(404).json({ success: false, message: "Blog post not found" });

    const blogObj = blog.toObject();
    blogObj.image = getFullImageUrl(blogObj.image, req);

    return res.status(200).json({ success: true, blog: blogObj });
  } catch (error) {
    console.error("Get blog by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blog post",
      error: error.message,
    });
  }
};

// ==============================
// DELETE BLOG POST
// ==============================
export const deleteBlogPost = async (req, res) => {
  try {
    const user = req.user;
    const blog = await BlogPost.findById(req.params.id);

    if (!blog || blog.isDeleted) return res.status(404).json({ success: false, message: "Blog post not found" });
    if (!blog.author?.equals(user._id)) return res.status(403).json({ success: false, message: "Forbidden" });

    blog.isDeleted = true;
    await blog.save();

    return res.status(200).json({ success: true, message: "Blog post deleted successfully" });
  } catch (error) {
    console.error("Delete blog error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete blog post",
      error: error.message,
    });
  }
};

// ==============================
// SEARCH BLOG POSTS
// ==============================
export const searchBlogs = async (req, res) => {
  try {
    const { q = "", page = 1, limit = 10, cat } = req.query;
    const safe = escapeRegex(q.slice(0, 200));

    const query = {
      isDeleted: false,
      published: true,
      $or: [
        { title: { $regex: safe, $options: "i" } },
        { content: { $regex: safe, $options: "i" } },
        { description: { $regex: safe, $options: "i" } },
      ],
    };
    if (cat) query.category = cat;

    const skip = (page - 1) * limit;

    const blogs = await BlogPost.find(query)
      .populate("author", "username email imageUrl")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await BlogPost.countDocuments(query);

    // Prepend host to local images
    const blogsWithFullUrl = blogs.map(blog => {
      const b = blog.toObject();
      b.image = getFullImageUrl(b.image, req);
      return b;
    });

    return res.status(200).json({
      success: true,
      blogs: blogsWithFullUrl,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Search blogs error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search blog posts",
      error: error.message,
    });
  }
};
