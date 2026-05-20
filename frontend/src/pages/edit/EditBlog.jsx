import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import "./EditBlog.css";
import { API_BASE } from "../../config/api";

const CATEGORIES = ["Technology", "Science", "Life", "Career", "Design", "Other"];

export default function EditBlog() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const [form, setForm] = useState({
    title: "", description: "", content: "",
    category: "", tags: "", image: null, imageUrl: "",
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchBlog = async () => {
      try {
        const token = await getToken({ skipCache: true });
        const res = await axios.get(`${API_BASE}/api/blogs/${blogId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const blog = res.data.blog;
        if (!blog) throw new Error("Blog not found");

        setForm({
          title: blog.title || "",
          description: blog.description || "",
          content: blog.content || "",
          category: blog.category || "",
          tags: blog.tags?.join(", ") || "",
          image: null,
          imageUrl: blog.image || "",
        });
        if (blog.image) setPreview(blog.image);
      } catch (err) {
        showToast(err.response?.data?.message || "Failed to load post.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId, isLoaded, isSignedIn, getToken]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, image: file, imageUrl: "" }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSignedIn) return showToast("You must be logged in.", "error");
    setSaving(true);

    try {
      const token = await getToken({ skipCache: true });
      const data = new FormData();
      data.append("title", form.title.trim());
      data.append("description", form.description.trim());
      data.append("content", form.content.trim());
      data.append("category", form.category || "Other");
      data.append("tags", form.tags.trim());
      if (form.image) data.append("image", form.image);
      else if (form.imageUrl) data.append("imageUrl", form.imageUrl.trim());

      await axios.put(`${API_BASE}/api/blogs/${blogId}`, data, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      showToast("Post updated successfully!");
      setTimeout(() => navigate("/blogs"), 1200);
    } catch (err) {
      showToast(err.response?.data?.message || "Update failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="eb-page">
        <div className="eb-skeleton-title" />
        <div className="eb-skeleton-form" />
      </div>
    );
  }

  return (
    <div className="eb-page">
      {toast && <div className={`eb-toast eb-toast-${toast.type}`}>{toast.msg}</div>}

      <div className="eb-header">
        <h2>Edit Post</h2>
        <p>Make changes and republish.</p>
      </div>

      <form className="eb-form" onSubmit={handleSubmit}>
        <div className="eb-field">
          <label htmlFor="eb-title">Title *</label>
          <input id="eb-title" name="title" value={form.title} onChange={handleChange} required />
        </div>

        <div className="eb-field">
          <label htmlFor="eb-desc">Subtitle / Description</label>
          <input id="eb-desc" name="description" placeholder="Short summary…" value={form.description} onChange={handleChange} />
        </div>

        <div className="eb-row">
          <div className="eb-field">
            <label htmlFor="eb-cat">Category</label>
            <select id="eb-cat" name="category" value={form.category} onChange={handleChange}>
              <option value="">Select…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="eb-field">
            <label htmlFor="eb-tags">Tags</label>
            <input id="eb-tags" name="tags" placeholder="react, node (comma separated)" value={form.tags} onChange={handleChange} />
          </div>
        </div>

        <div className="eb-field">
          <label htmlFor="eb-content">Content *</label>
          <textarea id="eb-content" name="content" rows="12" value={form.content} onChange={handleChange} required />
          <span className="eb-wordcount">
            {form.content.trim() ? form.content.trim().split(/\s+/).length : 0} words
          </span>
        </div>

        <div className="eb-image-section">
          <label className="eb-label">Cover Image</label>
          <div className="eb-image-options">
            <label className="eb-upload-btn" htmlFor="eb-file">
              {form.image ? "Change file" : "Upload new image"}
            </label>
            <input id="eb-file" type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
            <span className="eb-or">or</span>
            <input
              className="eb-url-input"
              name="imageUrl"
              placeholder="Paste image URL…"
              value={form.imageUrl}
              onChange={handleChange}
              disabled={!!form.image}
            />
          </div>
          {preview && (
            <div className="eb-preview">
              <img src={preview} alt="Cover" />
              <button
                type="button"
                className="eb-remove-img"
                onClick={() => { setForm((p) => ({ ...p, image: null, imageUrl: "" })); setPreview(null); }}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="eb-submit-row">
          <button type="button" className="eb-cancel" onClick={() => navigate("/blogs")}>Cancel</button>
          <button className="eb-submit" type="submit" disabled={saving}>
            {saving ? <span className="eb-spinner" /> : null}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
