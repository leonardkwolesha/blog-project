import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Footer.css";

const CATEGORIES = ["Technology", "Science", "Life", "Career", "Design", "Other"];

const QUICK_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Dashboard", to: "/dashboard" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [catHovered, setCatHovered] = useState(null);
  const navigate = useNavigate();

  const year = new Date().getFullYear();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  const handleCategoryClick = (cat) => {
    navigate(`/?cat=${encodeURIComponent(cat)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="ft">
      {/* Top wave divider */}
      <div className="ft-wave" aria-hidden="true">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#1a1a2e" />
        </svg>
      </div>

      <div className="ft-body">
        <div className="ft-grid">

          {/* Brand column */}
          <div className="ft-col ft-brand">
            <Link to="/" className="ft-logo">
              blogger<span className="ft-logo-accent">LK</span>
            </Link>
            <p className="ft-tagline">
              A space for developers to share knowledge, build ideas, and grow together.
            </p>
            <div className="ft-socials">
              <a href="#" className="ft-social-btn" aria-label="Twitter">
                <i className="fa-brands fa-x-twitter" />
              </a>
              <a href="#" className="ft-social-btn" aria-label="GitHub">
                <i className="fa-brands fa-github" />
              </a>
              <a href="#" className="ft-social-btn" aria-label="LinkedIn">
                <i className="fa-brands fa-linkedin-in" />
              </a>
              <a href="#" className="ft-social-btn" aria-label="YouTube">
                <i className="fa-brands fa-youtube" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="ft-col">
            <h4 className="ft-col-title">Quick Links</h4>
            <ul className="ft-links">
              {QUICK_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="ft-link">
                    <span className="ft-link-arrow">›</span> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="ft-col">
            <h4 className="ft-col-title">Categories</h4>
            <ul className="ft-links">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <button
                    className={`ft-cat-btn ${catHovered === cat ? "hovered" : ""}`}
                    onMouseEnter={() => setCatHovered(cat)}
                    onMouseLeave={() => setCatHovered(null)}
                    onClick={() => handleCategoryClick(cat)}
                  >
                    <span className="ft-link-arrow">›</span> {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="ft-col">
            <h4 className="ft-col-title">Stay Updated</h4>
            <p className="ft-newsletter-desc">
              Get notified when new articles drop.
            </p>
            {subscribed ? (
              <div className="ft-subscribed">
                <span>✓</span> You're in! Thanks for subscribing.
              </div>
            ) : (
              <form className="ft-newsletter" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  className="ft-email-input"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="ft-subscribe-btn">Subscribe</button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="ft-bottom">
          <p className="ft-copy">© {year} bloggerLK · Built for developers, by developers.</p>
          <div className="ft-bottom-links">
            <Link to="/privacy" className="ft-bottom-link">Privacy</Link>
            <span className="ft-bottom-sep" aria-hidden="true">·</span>
            <Link to="/terms" className="ft-bottom-link">Terms</Link>
            <span className="ft-bottom-sep" aria-hidden="true">·</span>
            <button
              className="ft-back-top"
              onClick={() => {
                document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
                document.body.scrollTo({ top: 0, behavior: "smooth" });
              }}
              aria-label="Back to top"
            >
              <span className="ft-arrow-icon">↑</span> Back to top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
