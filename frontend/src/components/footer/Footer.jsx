import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../../config/api";
import "./Footer.css";

const CATEGORIES = ["Technology", "Science", "Life", "Career", "Design", "Other"];

const QUICK_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Dashboard", to: "/dashboard" },
];

const LS_KEY = "bloglk_subscriber";

function readStored() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveStored(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch { /* blocked */ }
}

function clearStored() {
  try { localStorage.removeItem(LS_KEY); } catch { /* blocked */ }
}

export default function Footer() {
  const [email, setEmail]           = useState("");
  const [subStatus, setSubStatus]   = useState("idle"); // idle | loading | error
  const [subMsg, setSubMsg]         = useState("");
  const [sub, setSub]               = useState(() => readStored()); // null | { email, token }
  const [unsubbing, setUnsubbing]   = useState(false);
  const [unsubError, setUnsubError] = useState("");
  const [catHovered, setCatHovered] = useState(null);
  const navigate = useNavigate();

  const year = new Date().getFullYear();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (subStatus === "loading") return;

    setSubStatus("loading");
    setSubMsg("");
    try {
      const res = await axios.post(`${API_BASE}/api/subscribers`, { email: email.trim() });
      const stored = { email: res.data.email, token: res.data.token };
      saveStored(stored);
      setSub(stored);
      setEmail("");
      setSubStatus("idle");
    } catch (err) {
      const status = err.response?.status;
      const data   = err.response?.data;
      if (status === 409 && data?.token) {
        // Already subscribed — mark this browser as subscribed too
        const stored = { email: data.email, token: data.token };
        saveStored(stored);
        setSub(stored);
        setEmail("");
        setSubStatus("idle");
      } else {
        setSubStatus("error");
        setSubMsg(data?.message || "Subscription failed. Please try again.");
        setTimeout(() => setSubStatus("idle"), 6000);
      }
    }
  };

  const handleUnsubscribe = async () => {
    if (unsubbing || !sub?.token) return;
    setUnsubbing(true);
    setUnsubError("");
    try {
      await axios.delete(`${API_BASE}/api/subscribers`, { data: { token: sub.token } });
      clearStored();
      setSub(null);
    } catch (err) {
      setUnsubError(err.response?.data?.message || "Failed to unsubscribe. Please try again.");
      setTimeout(() => setUnsubError(""), 5000);
    } finally {
      setUnsubbing(false);
    }
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
              <a href="https://github.com/leonardkwolesha/" target="_blank" rel="noreferrer" className="ft-social-btn" aria-label="GitHub">
                <i className="fa-brands fa-github" />
              </a>
              <a href="https://www.linkedin.com/in/leonard-sengoma-39a337351/" target="_blank" rel="noreferrer" className="ft-social-btn" aria-label="LinkedIn">
                <i className="fa-brands fa-linkedin-in" />
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

            {sub ? (
              /* ── Subscribed state ── */
              <div className="ft-sub-active">
                <div className="ft-sub-active-badge">
                  <i className="fa-solid fa-circle-check" />
                  <span>Subscribed</span>
                </div>
                <p className="ft-sub-active-email" title={sub.email}>{sub.email}</p>
                {unsubError && (
                  <div className="ft-sub-feedback error" style={{ marginBottom: 8 }}>
                    <i className="fa-solid fa-triangle-exclamation" /> {unsubError}
                  </div>
                )}
                <button
                  className="ft-unsub-btn"
                  onClick={handleUnsubscribe}
                  disabled={unsubbing}
                >
                  {unsubbing
                    ? <><span className="ft-sub-spinner" /> Removing…</>
                    : <><i className="fa-solid fa-bell-slash" /> Unsubscribe</>}
                </button>
              </div>
            ) : (
              /* ── Form state ── */
              <>
                {subStatus === "error" && (
                  <div className="ft-sub-feedback error">
                    <i className="fa-solid fa-triangle-exclamation" /> {subMsg}
                  </div>
                )}

                <form className="ft-newsletter" onSubmit={handleSubscribe}>
                  <input
                    type="email"
                    className="ft-email-input"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={subStatus === "loading"}
                    required
                  />
                  <button
                    type="submit"
                    className="ft-subscribe-btn"
                    disabled={subStatus === "loading"}
                  >
                    {subStatus === "loading"
                      ? <><span className="ft-sub-spinner" /> Subscribing…</>
                      : "Subscribe"}
                  </button>
                </form>
              </>
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
