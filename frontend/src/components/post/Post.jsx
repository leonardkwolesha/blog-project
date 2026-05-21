import { useState } from "react";
import { Link } from "react-router-dom";
import "./post.css";

const FALLBACK = "https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg?auto=compress&cs=tinysrgb&w=800";

function calcReadTime(content) {
  const words = (content || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

// Read/write a boolean flag to localStorage keyed by post id + type
function getStored(id, type) {
  try { return localStorage.getItem(`blog_${type}_${id}`) === "true"; }
  catch { return false; }
}
function setStored(id, type, value) {
  try { localStorage.setItem(`blog_${type}_${id}`, value); }
  catch { /* storage blocked */ }
}

export default function Post({ blog }) {
  const [imgError, setImgError] = useState(false);

  if (!blog) return null;

  const { _id, title, description, image, author, createdAt, category, content, tags } = blog;

  // Initialise from localStorage so state survives page refresh
  const [liked,   setLiked]   = useState(() => getStored(_id, "liked"));
  const [saved,   setSaved]   = useState(() => getStored(_id, "saved"));
  const [likePop, setLikePop] = useState(false);
  const [savePop, setSavePop] = useState(false);

  const mins    = calcReadTime(content);
  const date    = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";
  const imgSrc  = (!image || imgError) ? FALLBACK : image;
  const initial = (author?.username || "A")[0].toUpperCase();

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    setStored(_id, "liked", next);
    setLikePop(true);
    setTimeout(() => setLikePop(false), 400);
  };

  const handleSave = () => {
    const next = !saved;
    setSaved(next);
    setStored(_id, "saved", next);
    setSavePop(true);
    setTimeout(() => setSavePop(false), 400);
  };

  return (
    <article className="post-card">

      {/* ── Image ── */}
      <Link to={`/post/${_id}`} className="post-card-img-wrap" tabIndex={-1}>
        <img
          className="post-card-img"
          src={imgSrc}
          alt={title}
          loading="lazy"
          onError={() => setImgError(true)}
        />

        <div className="post-card-hover-cta">
          <span className="post-card-cta-btn">
            <i className="fa-solid fa-book-open" /> Read Article
          </span>
        </div>

        <div className="post-card-img-overlay" />

        {category && category !== "Uncategorized" && (
          <span className="post-card-badge">{category}</span>
        )}

        <span className="post-card-read-badge">
          <i className="fa-regular fa-clock" /> {mins} min read
        </span>
      </Link>

      {/* ── Body ── */}
      <div className="post-card-body">

        {/* action row */}
        <div className="post-card-actions">
          <button
            className={[
              "post-card-action-btn",
              liked   ? "active-like" : "",
              likePop ? "popping"     : "",
            ].filter(Boolean).join(" ")}
            onClick={handleLike}
            title={liked ? "Unlike" : "Like"}
            aria-label={liked ? "Unlike this post" : "Like this post"}
            aria-pressed={liked}
          >
            <i className={liked ? "fa-solid fa-heart" : "fa-regular fa-heart"} />
          </button>
          <button
            className={[
              "post-card-action-btn",
              saved   ? "active-save" : "",
              savePop ? "popping"     : "",
            ].filter(Boolean).join(" ")}
            onClick={handleSave}
            title={saved ? "Unsave" : "Save"}
            aria-label={saved ? "Unsave this post" : "Save this post"}
            aria-pressed={saved}
          >
            <i className={saved ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"} />
          </button>
          {saved && (
            <span className="post-card-saved-label">Saved</span>
          )}
        </div>

        <Link to={`/post/${_id}`} className="post-card-title-link">
          <h2 className="post-card-title">{title}</h2>
        </Link>

        {description && (
          <p className="post-card-excerpt">
            {description.length > 115 ? description.slice(0, 115) + "…" : description}
          </p>
        )}

        {tags?.length > 0 && (
          <div className="post-card-tags">
            {tags.slice(0, 3).map(tag => (
              <span key={tag} className="post-card-tag">#{tag}</span>
            ))}
          </div>
        )}

        <div className="post-card-meta-row">
          <Link
            to={`/post/${_id}#comments`}
            className="post-card-comment-count"
            title="View comments"
            aria-label={`${blog.commentCount || 0} comments`}
          >
            <i className="fa-regular fa-comment" />
            <span>{blog.commentCount || 0}</span>
          </Link>
        </div>

        <div className="post-card-footer">
          <div className="post-card-author-wrap">
            <div className="post-card-avatar" aria-hidden="true">{initial}</div>
            <div className="post-card-author-info">
              <span className="post-card-author">{author?.username || "Anonymous"}</span>
              <span className="post-card-date">{date}</span>
            </div>
          </div>

          <Link to={`/post/${_id}`} className="post-card-read-link">
            Read more <i className="fa-solid fa-arrow-right post-card-arrow" />
          </Link>
        </div>
      </div>
    </article>
  );
}
