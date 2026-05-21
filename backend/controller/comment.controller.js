import Comment  from "../models/comment.model.js";
import BlogPost from "../models/BlogPost.model.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/comments/:postId  — paginated, newest first
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({ postId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Comment.countDocuments({ postId }),
    ]);

    return res.json({
      success: true,
      comments,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("getComments error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to load comments." });
  }
};

// POST /api/comments/:postId  — add a comment
export const addComment = async (req, res) => {
  try {
    const { postId }           = req.params;
    const { name, email = "", content } = req.body;

    if (!name || typeof name !== "string" || !name.trim())
      return res.status(400).json({ success: false, message: "Name is required." });

    if (email && !EMAIL_RE.test(email.trim()))
      return res.status(400).json({ success: false, message: "Enter a valid email or leave it blank." });

    if (!content || typeof content !== "string" || content.trim().length < 3)
      return res.status(400).json({ success: false, message: "Comment must be at least 3 characters." });

    if (content.trim().length > 1000)
      return res.status(400).json({ success: false, message: "Comment must be 1000 characters or less." });

    const post = await BlogPost.findById(postId).select("_id isDeleted");
    if (!post || post.isDeleted)
      return res.status(404).json({ success: false, message: "Blog post not found." });

    const comment = await Comment.create({
      postId,
      name:    name.trim().slice(0, 100),
      email:   email.trim().toLowerCase().slice(0, 200),
      content: content.trim().slice(0, 1000),
    });

    // Keep the denormalised counter in sync (atomic, no race)
    await BlogPost.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    return res.status(201).json({ success: true, comment });
  } catch (err) {
    console.error("addComment error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to post comment." });
  }
};
