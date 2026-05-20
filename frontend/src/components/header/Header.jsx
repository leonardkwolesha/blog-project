import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./header.css";

const CATEGORIES = ["All", "Technology", "Science", "Life", "Career", "Design", "Other"];

const CAT_ICONS = {
  All: "fa-solid fa-border-all",
  Technology: "fa-solid fa-microchip",
  Science: "fa-solid fa-flask",
  Life: "fa-solid fa-heart",
  Career: "fa-solid fa-briefcase",
  Design: "fa-solid fa-palette",
  Other: "fa-solid fa-ellipsis",
};

export default function Header({ onCategoryChange, activeCategory }) {
  const [search, setSearch]   = useState("");
  const [focused, setFocused] = useState(false);
  const bgRef   = useRef(null);
  const navigate = useNavigate();

  // Parallax on hero background
  useEffect(() => {
    const onScroll = () => {
      if (!bgRef.current) return;
      bgRef.current.style.transform = `translateY(${window.scrollY * 0.38}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    const params = new URLSearchParams({ q: search.trim() });
    if (activeCategory) params.set("cat", activeCategory);
    navigate(`/search?${params.toString()}`);
  };

  const handleCategory = (cat) => {
    if (onCategoryChange) onCategoryChange(cat === "All" ? "" : cat);
  };

  return (
    <div className="hero">
      {/* Parallax background */}
      <div className="hero-bg" ref={bgRef} />
      <div className="hero-overlay" />

      <div className="hero-content">
        <p className="hero-tagline">
          <span><i className="fa-solid fa-circle-dot hero-tagline-dot" /></span>
          Developer Insights · Tutorials · Trends
          <span><i className="fa-solid fa-circle-dot hero-tagline-dot" /></span>
        </p>

        <h1 className="hero-title">
          <span className="hero-title-line hero-anim-1">Where Developers</span>
          <span className="hero-title-line hero-anim-2">Share <em className="hero-title-em">Ideas</em></span>
        </h1>

        <p className="hero-sub hero-anim-3">
          Read and share knowledge on the latest in tech, tools, and best practices.
        </p>

        <form
          className={`hero-search hero-anim-4 ${focused ? "focused" : ""}`}
          onSubmit={handleSearch}
        >
          <i className="fa-solid fa-magnifying-glass hero-search-icon" />
          <input
            className="hero-search-input"
            type="text"
            placeholder="Search articles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <button className="hero-search-btn" type="submit">Search</button>
        </form>

        <div className="hero-cats hero-anim-5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`hero-cat-btn ${(!activeCategory && cat === "All") || activeCategory === cat ? "active" : ""}`}
              onClick={() => handleCategory(cat)}
            >
              <i className={CAT_ICONS[cat]} />
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll-hint" aria-hidden="true">
        <i className="fa-solid fa-chevron-down" />
      </div>
    </div>
  );
}
