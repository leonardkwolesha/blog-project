// models/BlogPost.model.js
import mongoose from "mongoose";

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: 500,
    },
    image: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "Uncategorized",
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    published: {
      type: Boolean,
      default: true,
    },
    slug: {
      type: String,
      default: "",
      unique: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==============================
// Indexes for faster queries
// ==============================
blogPostSchema.index({ author: 1, createdAt: -1 });
blogPostSchema.index({ category: 1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ title: "text", content: "text", description: "text" });

// ==============================
// Virtual: excerpt (first 150 characters of content)
// ==============================
blogPostSchema.virtual("excerpt").get(function () {
  return this.content ? this.content.substring(0, 150) + "..." : "";
});

// ==============================
// Pre-save hook: validate author & generate slug
// ==============================
blogPostSchema.pre("save", async function () {
  // Validate author ObjectId
  if (this.author && !mongoose.Types.ObjectId.isValid(this.author)) {
    throw new Error("Invalid author ObjectId");
  }

  // Auto-generate slug if missing
  if (this.title && !this.slug) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "") +
      "-" +
      Date.now() +
      Math.random().toString(36).slice(2, 6);
  }
});

const BlogPost = mongoose.models.BlogPost || mongoose.model("BlogPost", blogPostSchema);

export default BlogPost;
