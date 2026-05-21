import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../config/api";
import "./comments.css";

const MAX_CONTENT = 1000;

// Deterministic pastel from a name string
function nameColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return `hsl(${Math.abs(h) % 360}, 62%, 52%)`;
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function CommentSkeleton() {
  return (
    <div className="cm-skeleton-item" aria-hidden="true">
      <div className="cm-sk cm-sk-avatar" />
      <div className="cm-sk-body">
        <div className="cm-sk cm-sk-name" />
        <div className="cm-sk cm-sk-line" />
        <div className="cm-sk cm-sk-line short" />
      </div>
    </div>
  );
}

function CommentItem({ comment }) {
  const initial = (comment.name || "?")[0].toUpperCase();
  const color   = nameColor(comment.name);
  return (
    <div className="cm-item">
      <div className="cm-avatar" style={{ background: color }} aria-hidden="true">
        {initial}
      </div>
      <div className="cm-item-body">
        <div className="cm-item-header">
          <span className="cm-item-name">{comment.name}</span>
          <span className="cm-item-time">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="cm-item-text">{comment.content}</p>
      </div>
    </div>
  );
}

function validate(form) {
  const e = {};
  if (!form.name.trim())    e.name    = "Name is required.";
  if (!form.content.trim()) e.content = "Comment cannot be empty.";
  else if (form.content.trim().length < 3) e.content = "Comment must be at least 3 characters.";
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    e.email = "Enter a valid email or leave it blank.";
  return e;
}

export default function Comments({ postId }) {
  const { user } = useAuth();

  const [comments, setComments]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [form, setForm]       = useState({ name: user?.username || "", email: "", content: "" });
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // "success" | "error"
  const [submitMsg, setSubmitMsg]     = useState("");

  const sectionRef = useRef(null);

  // Pre-fill name when user logs in mid-session
  useEffect(() => {
    if (user?.username) setForm((p) => ({ ...p, name: p.name || user.username }));
  }, [user]);

  useEffect(() => {
    if (!postId) return;
    const ctrl = new AbortController();
    setLoading(true);
    axios
      .get(`${API_BASE}/api/comments/${postId}?page=1&limit=10`, { signal: ctrl.signal })
      .then((r) => {
        setComments(r.data.comments);
        setTotal(r.data.pagination.total);
        setTotalPages(r.data.pagination.pages);
        setPage(1);
      })
      .catch((err) => { if (err.name !== "CanceledError") console.error(err); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [postId]);

  const loadMore = async () => {
    const next = page + 1;
    setLoadingMore(true);
    try {
      const r = await axios.get(`${API_BASE}/api/comments/${postId}?page=${next}&limit=10`);
      setComments((p) => [...p, ...r.data.comments]);
      setPage(next);
      setTotalPages(r.data.pagination.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "content" && value.length > MAX_CONTENT) return;
    setForm((p) => ({ ...p, [name]: value }));
    if (touched[name]) {
      const errs = validate({ ...form, [name]: value });
      setErrors((p) => ({ ...p, [name]: errs[name] }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    setErrors((p) => ({ ...p, [name]: validate(form)[name] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    setTouched({ name: true, email: true, content: true });
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    setSubmitStatus(null);
    try {
      const r = await axios.post(`${API_BASE}/api/comments/${postId}`, {
        name:    form.name.trim(),
        email:   form.email.trim(),
        content: form.content.trim(),
      });
      // Prepend to list so user sees it immediately
      setComments((p) => [r.data.comment, ...p]);
      setTotal((t) => t + 1);
      setForm((p) => ({ ...p, content: "" }));
      setTouched({});
      setErrors({});
      setSubmitStatus("success");
      setSubmitMsg("Comment posted!");
      setTimeout(() => setSubmitStatus(null), 4000);
    } catch (err) {
      setSubmitStatus("error");
      setSubmitMsg(err.response?.data?.message || "Failed to post comment. Please try again.");
      setTimeout(() => setSubmitStatus(null), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const charsLeft = MAX_CONTENT - form.content.length;

  return (
    <section className="cm-section" id="comments" ref={sectionRef}>
      <div className="cm-header">
        <h2 className="cm-title">
          <i className="fa-regular fa-comments cm-title-icon" />
          {total > 0 ? `${total} Comment${total !== 1 ? "s" : ""}` : "Comments"}
        </h2>
      </div>

      {/* ── Comment list ── */}
      <div className="cm-list">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <CommentSkeleton key={i} />)
        ) : comments.length === 0 ? (
          <div className="cm-empty">
            <i className="fa-regular fa-comment-dots cm-empty-icon" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((c) => <CommentItem key={c._id} comment={c} />)
        )}
      </div>

      {/* ── Load more ── */}
      {!loading && page < totalPages && (
        <button
          className="cm-load-more"
          onClick={loadMore}
          disabled={loadingMore}
        >
          {loadingMore
            ? <><span className="cm-btn-spinner" /> Loading…</>
            : `Load more comments (${total - comments.length} remaining)`}
        </button>
      )}

      {/* ── Form ── */}
      <div className="cm-form-wrap">
        <h3 className="cm-form-title">
          <i className="fa-solid fa-pen-to-square" /> Leave a Comment
        </h3>

        {submitStatus === "success" && (
          <div className="cm-toast success">
            <i className="fa-solid fa-circle-check" /> {submitMsg}
          </div>
        )}
        {submitStatus === "error" && (
          <div className="cm-toast error">
            <i className="fa-solid fa-circle-xmark" /> {submitMsg}
          </div>
        )}

        <form className="cm-form" onSubmit={handleSubmit} noValidate>
          <div className="cm-row">
            {/* Name */}
            <div className={`cm-field ${errors.name && touched.name ? "has-error" : ""}`}>
              <label htmlFor="cm-name">
                <i className="fa-solid fa-user" /> Name <span className="cm-required">*</span>
              </label>
              <input
                id="cm-name"
                name="name"
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="name"
              />
              {errors.name && touched.name && (
                <span className="cm-error-msg"><i className="fa-solid fa-triangle-exclamation" /> {errors.name}</span>
              )}
            </div>

            {/* Email */}
            <div className={`cm-field ${errors.email && touched.email ? "has-error" : ""}`}>
              <label htmlFor="cm-email">
                <i className="fa-solid fa-envelope" /> Email <span className="cm-optional">(optional)</span>
              </label>
              <input
                id="cm-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="email"
              />
              {errors.email && touched.email && (
                <span className="cm-error-msg"><i className="fa-solid fa-triangle-exclamation" /> {errors.email}</span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className={`cm-field cm-field-msg ${errors.content && touched.content ? "has-error" : ""}`}>
            <label htmlFor="cm-content">
              <i className="fa-solid fa-comment-dots" /> Comment <span className="cm-required">*</span>
            </label>
            <textarea
              id="cm-content"
              name="content"
              rows={5}
              placeholder="Share your thoughts on this article…"
              value={form.content}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <div className="cm-char-row">
              {errors.content && touched.content && (
                <span className="cm-error-msg">
                  <i className="fa-solid fa-triangle-exclamation" /> {errors.content}
                </span>
              )}
              <span className={`cm-chars ${charsLeft < 100 ? "low" : ""}`}>{charsLeft} left</span>
            </div>
          </div>

          <button className="cm-submit" type="submit" disabled={submitting}>
            {submitting
              ? <><span className="cm-btn-spinner" /> Posting…</>
              : <><i className="fa-solid fa-paper-plane" /> Post Comment</>}
          </button>
        </form>
      </div>
    </section>
  );
}
