import { useState } from "react";
import { Link } from "react-router-dom";
import "./post.css";

const FALLBACK = "https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg?auto=compress&cs=tinysrgb&w=800";

function calcReadTime(content) {
  const words = (content || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function Post({ blog }) {
  const [imgError, setImgError]   = useState(false);
  const [liked, setLiked]         = useState(false);
  const [likePop, setLikePop]     = useState(false);
  const [saved, setSaved]         = useState(false);
  const [savePop, setSavePop]     = useState(false);

  if (!blog) return null;

  const { _id, title, description, image, author, createdAt, category, content, tags } = blog;
  const mins   = calcReadTime(content);
  const date   = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";
  const imgSrc  = (!image || imgError) ? FALLBACK : image;
  const initial = (author?.username || "A")[0].toUpperCase();

  const handleLike = () => {
    setLiked(v => !v);
    setLikePop(true);
    setTimeout(() => setLikePop(false), 400);
  };

  const handleSave = () => {
    setSaved(v => !v);
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

        {/* full-cover hover CTA */}
        <div className="post-card-hover-cta">
          <span className="post-card-cta-btn">
            <i className="fa-solid fa-book-open" /> Read Article
          </span>
        </div>

        {/* dark gradient */}
        <div className="post-card-img-overlay" />

        {/* category badge */}
        {category && category !== "Uncategorized" && (
          <span className="post-card-badge">{category}</span>
        )}

        {/* read-time */}
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
              liked    ? "active-like" : "",
              likePop  ? "popping"     : "",
            ].filter(Boolean).join(" ")}
            onClick={handleLike}
            title={liked ? "Unlike" : "Like"}
          >
            <i className={liked ? "fa-solid fa-heart" : "fa-regular fa-heart"} />
          </button>
          <button
            className={[
              "post-card-action-btn",
              saved    ? "active-save" : "",
              savePop  ? "popping"     : "",
            ].filter(Boolean).join(" ")}
            onClick={handleSave}
            title={saved ? "Unsave" : "Save"}
          >
            <i className={saved ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"} />
          </button>
        </div>

        <Link to={`/post/${_id}`} className="post-card-title-link">
          <h2 className="post-card-title">{title}</h2>
        </Link>

        {description && (
          <p className="post-card-excerpt">
            {description.length > 115 ? description.slice(0, 115) + "…" : description}
          </p>
        )}

        {/* tags */}
        {tags?.length > 0 && (
          <div className="post-card-tags">
            {tags.slice(0, 3).map(tag => (
              <span key={tag} className="post-card-tag">#{tag}</span>
            ))}
          </div>
        )}

        {/* footer */}
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
