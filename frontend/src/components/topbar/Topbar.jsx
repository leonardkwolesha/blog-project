import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/clerk-react";
import "./topbar.css";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Topbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [readProgress, setReadProgress] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  const isSinglePost = location.pathname.startsWith("/post/");

  // Scroll shadow + reading progress
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      if (isSinglePost) {
        const el = document.documentElement;
        const scrolled = el.scrollTop;
        const total = el.scrollHeight - el.clientHeight;
        setReadProgress(total > 0 ? Math.round((scrolled / total) * 100) : 0);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isSinglePost]);

  // Auto-focus search input
  useEffect(() => {
    if (showSearch) inputRef.current?.focus();
  }, [showSearch]);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setShowSearch(false);
    setQuery("");
  }, [location.pathname]);

  // Keyboard shortcut: / to open search
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const submitSearch = () => {
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setShowSearch(false);
    setQuery("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") submitSearch();
    if (e.key === "Escape") { setShowSearch(false); setQuery(""); }
  };

  return (
    <>
      <header className={`nav ${scrolled ? "nav-scrolled" : ""} ${menuOpen ? "menu-open" : ""}`}>
        <div className="nav-inner">
          {/* Logo */}
          <Link to="/" className="nav-logo" aria-label="bloggerLK home">
            <span className="nav-logo-icon" aria-hidden="true">
              <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="26" height="26" rx="7" fill="url(#lg)" />
                <path d="M8 9h8M8 14h12M8 19h6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="lg" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ff6b00"/>
                    <stop offset="1" stopColor="#e63946"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <span className="nav-logo-text">
              <span className="nav-logo-word">blogger</span><span className="nav-logo-accent">LK</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="nav-links" aria-label="Main navigation">
            {NAV_LINKS.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className={`nav-link ${isActive(to) ? "nav-link-active" : ""}`}
              >
                {label}
                {isActive(to) && <span className="nav-link-dot" aria-hidden="true" />}
              </Link>
            ))}
            <SignedIn>
              <Link
                to="/dashboard"
                className={`nav-link nav-link-dashboard ${isActive("/dashboard") ? "nav-link-active" : ""}`}
              >
                Dashboard
              </Link>
            </SignedIn>
          </nav>

          {/* Right controls */}
          <div className="nav-right">
            {/* Search */}
            <div className={`nav-search-wrap ${showSearch ? "expanded" : ""}`}>
              {showSearch && (
                <div className="nav-search-box">
                  <i className="fa-solid fa-magnifying-glass nav-search-icon-inner" aria-hidden="true" />
                  <input
                    ref={inputRef}
                    type="text"
                    className="nav-search-input"
                    placeholder="Search posts…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    aria-label="Search posts"
                  />
                  {query && (
                    <button className="nav-search-clear" onClick={() => setQuery("")} aria-label="Clear search">×</button>
                  )}
                  <button className="nav-search-close" onClick={() => { setShowSearch(false); setQuery(""); }} aria-label="Close search">
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
              )}
              {!showSearch && (
                <button
                  className="nav-icon-btn"
                  onClick={() => setShowSearch(true)}
                  aria-label="Open search (press /)"
                  title="Search (press /)"
                >
                  <i className="fa-solid fa-magnifying-glass" />
                </button>
              )}
            </div>

            {/* Auth */}
            <SignedOut>
              <SignInButton mode="modal">
                <button className="nav-login-btn">Login</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            {/* Hamburger */}
            <button
              className={`nav-hamburger ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Reading progress bar (single post only) */}
        {isSinglePost && (
          <div className="nav-progress-bar">
            <div className="nav-progress-fill" style={{ width: `${readProgress}%` }} />
          </div>
        )}

        {/* Mobile menu */}
        <div className={`nav-mobile-menu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className={`nav-mobile-link ${isActive(to) ? "active" : ""}`}
            >
              {label}
            </Link>
          ))}
          <SignedIn>
            <Link
              to="/dashboard"
              className={`nav-mobile-link ${isActive("/dashboard") ? "active" : ""}`}
            >
              Dashboard
            </Link>
          </SignedIn>
          <div className="nav-mobile-search">
            <input
              type="text"
              placeholder="Search posts…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="nav-mobile-search-input"
            />
            <button onClick={submitSearch} className="nav-mobile-search-btn">
              <i className="fa-solid fa-magnifying-glass" />
            </button>
          </div>
        </div>
      </header>

      {/* Overlay when mobile menu is open */}
      {menuOpen && (
        <div className="nav-overlay" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}
    </>
  );
}
