import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./singlePost.css";
import { API_BASE } from "../../config/api";

const FALLBACK = "https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg?auto=compress&cs=tinysrgb&w=1400";

function calcReadTime(content) {
  const words = (content || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function SinglePost() {
  const { id } = useParams();
  const [blog, setBlog]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [imgError, setImgError] = useState(false);
  const heroRef   = useRef(null);
  const imgRef    = useRef(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    axios
      .get(`${API_BASE}/api/blogs/${id}`, { signal: controller.signal })
      .then((res) => setBlog(res.data.blog))
      .catch((err) => {
        if (err.name !== "CanceledError") {
          const status = err.response?.status;
          setError(status === 404 ? "Blog post not found." : "Failed to load post. Please try again.");
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [id]);

  // Parallax scroll on hero image
  useEffect(() => {
    const onScroll = () => {
      if (!imgRef.current) return;
      imgRef.current.style.transform = `scale(1.08) translateY(${window.scrollY * 0.18}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (loading) return (
    <div className="sp-loading">
      <div className="sp-skeleton-hero" />
      <div className="sp-skeleton-body">
        <div className="sp-skeleton-line wide" />
        <div className="sp-skeleton-line medium" />
        <div className="sp-skeleton-line narrow" />
        <div className="sp-skeleton-line wide" />
        <div className="sp-skeleton-line wide" />
      </div>
    </div>
  );

  if (error) return (
    <div className="sp-error">
      <i className="fa-solid fa-triangle-exclamation sp-error-icon" />
      <p>{error}</p>
      <Link to="/" className="sp-back-btn"><i className="fa-solid fa-arrow-left" /> Back to Home</Link>
    </div>
  );

  if (!blog) return null;

  const mins   = calcReadTime(blog.content);
  const date   = new Date(blog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const imgSrc = (!blog.image || imgError) ? FALLBACK : blog.image;
  const initial = (blog.author?.username || "A")[0].toUpperCase();

  return (
    <article className="single-post">

      {/* ── Hero ── */}
      <div className="sp-hero" ref={heroRef}>
        <img
          ref={imgRef}
          src={imgSrc}
          alt={blog.title}
          className="sp-hero-img"
          onError={() => setImgError(true)}
        />
        <div className="sp-hero-overlay" />

        {blog.category && blog.category !== "Uncategorized" && (
          <span className="sp-hero-badge">{blog.category}</span>
        )}

        <div className="sp-hero-content">
          <h1 className="sp-hero-title">{blog.title}</h1>
          <div className="sp-hero-meta">
            <div className="sp-hero-avatar">{initial}</div>
            <span className="sp-hero-author">{blog.author?.username || "Anonymous"}</span>
            <span className="sp-hero-sep" aria-hidden="true">·</span>
            <span>{date}</span>
            <span className="sp-hero-sep" aria-hidden="true">·</span>
            <span className="sp-hero-readtime">
              <i className="fa-regular fa-clock" /> {mins} min read
            </span>
          </div>
        </div>

        <div className="sp-scroll-hint" aria-hidden="true">
          <i className="fa-solid fa-chevron-down" />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="sp-content">
        {blog.description && (
          <p className="sp-subtitle">{blog.description}</p>
        )}

        {blog.tags?.length > 0 && (
          <div className="sp-tags">
            {blog.tags.map((tag) => (
              <span key={tag} className="sp-tag">#{tag}</span>
            ))}
          </div>
        )}

        <div className="sp-body">
          {blog.content.split("\n").map((para, i) =>
            para.trim() ? <p key={i}>{para}</p> : <br key={i} />
          )}
        </div>

        <Link to="/" className="sp-back-btn">
          <i className="fa-solid fa-arrow-left" /> Back to all posts
        </Link>
      </div>
    </article>
  );
}
