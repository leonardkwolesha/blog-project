import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import "./ViewBlog.css";
import { API_BASE } from "../../config/api";

const EXCERPT_LEN = 160;
const FALLBACK_IMG = "https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg?auto=compress&cs=tinysrgb&w=400";

function excerpt(text) {
  if (!text) return "";
  return text.length > EXCERPT_LEN ? text.slice(0, EXCERPT_LEN) + "…" : text;
}

function BlogCard({ blog, onDelete }) {
  const [imgSrc, setImgSrc] = useState(blog.image || FALLBACK_IMG);

  const date = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";

  return (
    <div className="vb-card">
      <Link to={`/post/${blog._id}`} className="vb-card-img-wrap" tabIndex={-1}>
        <img
          src={imgSrc}
          alt={blog.title}
          className="vb-card-img"
          onError={() => setImgSrc(FALLBACK_IMG)}
        />
        <div className="vb-card-img-overlay">
          <span className="vb-card-img-cta">
            <i className="fa-solid fa-eye" /> View
          </span>
        </div>
      </Link>

      <div className="vb-card-body">
        <div className="vb-card-top">
          {blog.category && blog.category !== "Uncategorized" && (
            <span className="vb-category">{blog.category}</span>
          )}
          <span className="vb-date">{date}</span>
        </div>
        <h3 className="vb-title">{blog.title}</h3>
        {(blog.description || blog.content) && (
          <p className="vb-desc">{excerpt(blog.description || blog.content)}</p>
        )}
        <div className="vb-actions">
          <Link to={`/post/${blog._id}`} className="vb-btn vb-btn-view">
            <i className="fa-solid fa-eye" /> View
          </Link>
          <Link to={`/blogs/edit/${blog._id}`} className="vb-btn vb-btn-edit">
            <i className="fa-solid fa-pen" /> Edit
          </Link>
          <button className="vb-btn vb-btn-delete" onClick={onDelete}>
            <i className="fa-solid fa-trash" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ViewBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchBlogs = async () => {
      try {
        const token = await getToken();
        const res = await axios.get(`${API_BASE}/api/blogs`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 50 },
        });
        const data = Array.isArray(res.data.blogs) ? res.data.blogs : [];
        setBlogs(data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [isLoaded, isSignedIn, getToken]);

  const handleDelete = async (blogId) => {
    try {
      const token = await getToken();
      await axios.delete(`${API_BASE}/api/blogs/${blogId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs((prev) => prev.filter((b) => b._id !== blogId));
      showToast("Blog deleted.");
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed.", "error");
    } finally {
      setConfirmId(null);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="vb-container">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="vb-skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div className="vb-container">
      {toast && <div className={`vb-toast vb-toast-${toast.type}`}>{toast.msg}</div>}

      {confirmId && (
        <div className="vb-confirm-overlay">
          <div className="vb-confirm-box">
            <p>Delete this blog post?</p>
            <p className="vb-confirm-sub">This action cannot be undone.</p>
            <div className="vb-confirm-actions">
              <button className="vb-btn-cancel" onClick={() => setConfirmId(null)}>Cancel</button>
              <button className="vb-btn-delete-confirm" onClick={() => handleDelete(confirmId)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {blogs.length === 0 ? (
        <div className="vb-empty">
          <i className="fa-solid fa-pen-to-square vb-empty-icon" />
          <p>No posts yet. <Link to="/create-blog">Write your first post →</Link></p>
        </div>
      ) : (
        <div className="vb-list">
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} onDelete={() => setConfirmId(blog._id)} />
          ))}
        </div>
      )}
    </div>
  );
}
