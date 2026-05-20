import { useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./CreateBlog.css";
import { API_BASE } from "../../config/api";

const CATEGORIES = ["Technology", "Science", "Life", "Career", "Design", "Other"];
const MAX_FILE_MB = 5;

export default function CreateBlog() {
  const { token, isSignedIn } = useAuth();

  const [form, setForm] = useState({
    title: "", description: "", content: "",
    category: "", tags: "", image: null, imageUrl: "",
  });
  const [preview, setPreview]   = useState(null);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState(null);
  const fileRef = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const applyFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return showToast("Only image files are allowed.", "error");
    if (file.size > MAX_FILE_MB * 1024 * 1024)
      return showToast(`Image must be smaller than ${MAX_FILE_MB} MB.`, "error");

    setForm((p) => ({ ...p, image: file, imageUrl: "" }));
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
  };

  const handleFile  = (e)  => applyFile(e.target.files[0]);
  const handleDrop  = (e)  => { e.preventDefault(); setDragOver(false); applyFile(e.dataTransfer.files[0]); };
  const handleDragO = (e)  => { e.preventDefault(); setDragOver(true);  };
  const handleDragL = ()   => setDragOver(false);

  const removeImage = () => {
    setForm((p) => ({ ...p, image: null, imageUrl: "" }));
    setPreview(null);
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSignedIn)              return showToast("You must be logged in.", "error");
    if (!form.title.trim())       return showToast("Title is required.", "error");
    if (!form.content.trim())     return showToast("Content is required.", "error");

    setLoading(true);
    try {
      const data  = new FormData();
      data.append("title",       form.title.trim());
      data.append("description", form.description.trim());
      data.append("content",     form.content.trim());
      data.append("category",    form.category || "Other");
      data.append("tags",        form.tags.trim());
      if (form.image)        data.append("image",    form.image);
      else if (form.imageUrl) data.append("imageUrl", form.imageUrl.trim());

      await axios.post(`${API_BASE}/api/blogs/create`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showToast("Blog published successfully!");
      setForm({ title: "", description: "", content: "", category: "", tags: "", image: null, imageUrl: "" });
      setPreview(null);
      setFileName("");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to publish. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;

  return (
    <div className="cb-page">
      {toast && (
        <div className={`cb-toast cb-toast-${toast.type}`}>
          <i className={toast.type === "success" ? "fa-solid fa-circle-check" : "fa-solid fa-circle-xmark"} />
          {toast.msg}
        </div>
      )}

      <div className="cb-header">
        <div className="cb-header-icon"><i className="fa-solid fa-pen-nib" /></div>
        <h2>Write a New Post</h2>
        <p>Share your insights with the developer community.</p>
      </div>

      <form className="cb-form" onSubmit={handleSubmit}>

        {/* Title */}
        <div className="cb-field">
          <label htmlFor="cb-title">
            <i className="fa-solid fa-heading" /> Title <span className="cb-required">*</span>
          </label>
          <input
            id="cb-title" name="title"
            placeholder="A compelling title…"
            value={form.title} onChange={handleChange} required
          />
        </div>

        {/* Description */}
        <div className="cb-field">
          <label htmlFor="cb-desc">
            <i className="fa-solid fa-align-left" /> Subtitle / Description
          </label>
          <input
            id="cb-desc" name="description"
            placeholder="A short summary of what this post is about…"
            value={form.description} onChange={handleChange}
          />
        </div>

        {/* Category + Tags */}
        <div className="cb-row">
          <div className="cb-field">
            <label htmlFor="cb-cat"><i className="fa-solid fa-tag" /> Category</label>
            <select id="cb-cat" name="category" value={form.category} onChange={handleChange}>
              <option value="">Select a category…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="cb-field">
            <label htmlFor="cb-tags"><i className="fa-solid fa-tags" /> Tags</label>
            <input
              id="cb-tags" name="tags"
              placeholder="react, javascript, node"
              value={form.tags} onChange={handleChange}
            />
          </div>
        </div>

        {/* Content */}
        <div className="cb-field">
          <label htmlFor="cb-content">
            <i className="fa-solid fa-file-lines" /> Content <span className="cb-required">*</span>
          </label>
          <textarea
            id="cb-content" name="content"
            placeholder="Write your article here…"
            rows="14" value={form.content} onChange={handleChange} required
          />
          <span className="cb-wordcount">
            <i className="fa-solid fa-chart-simple" /> {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
        </div>

        {/* Cover Image */}
        <div className="cb-image-section">
          <label className="cb-label">
            <i className="fa-solid fa-image" /> Cover Image
          </label>

          {!preview ? (
            <div
              className={`cb-dropzone ${dragOver ? "cb-dropzone-over" : ""}`}
              onDrop={handleDrop}
              onDragOver={handleDragO}
              onDragLeave={handleDragL}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef} id="cb-file" type="file" accept="image/*"
                onChange={handleFile} style={{ display: "none" }}
              />
              <div className="cb-dropzone-icon">
                <i className="fa-solid fa-cloud-arrow-up" />
              </div>
              <p className="cb-dropzone-title">
                {dragOver ? "Drop your image here" : "Drag & drop or click to upload"}
              </p>
              <p className="cb-dropzone-hint">PNG, JPG, WEBP — max {MAX_FILE_MB} MB</p>
              <div className="cb-dropzone-divider"><span>or paste a URL below</span></div>
              <input
                className="cb-url-input"
                name="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={form.imageUrl}
                onChange={(e) => { e.stopPropagation(); handleChange(e); }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ) : (
            <div className="cb-preview">
              <img src={preview} alt="Cover preview" />
              <div className="cb-preview-overlay">
                <div className="cb-preview-info">
                  {fileName && (
                    <span className="cb-preview-name">
                      <i className="fa-solid fa-file-image" /> {fileName}
                    </span>
                  )}
                </div>
                <div className="cb-preview-actions">
                  <label htmlFor="cb-file-change" className="cb-preview-btn cb-preview-btn-change">
                    <i className="fa-solid fa-arrow-up-from-bracket" /> Change
                  </label>
                  <input
                    ref={fileRef} id="cb-file-change" type="file" accept="image/*"
                    onChange={handleFile} style={{ display: "none" }}
                  />
                  <button type="button" className="cb-preview-btn cb-preview-btn-remove" onClick={removeImage}>
                    <i className="fa-solid fa-trash" /> Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button className="cb-submit" type="submit" disabled={loading}>
          {loading
            ? <><span className="cb-spinner" /> Publishing…</>
            : <><i className="fa-solid fa-rocket" /> Publish Post</>
          }
        </button>
      </form>
    </div>
  );
}
