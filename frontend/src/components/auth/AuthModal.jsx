import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../config/api";
import "./AuthModal.css";

export default function AuthModal({ onClose, defaultTab = "login" }) {
  const [tab, setTab] = useState(defaultTab);
  const [form, setForm] = useState({ email: "", password: "", username: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const overlayRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const switchTab = (t) => {
    setTab(t);
    setError("");
    setShowPw(false);
    setForm({ email: "", password: "", username: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = tab === "login"
        ? `${API_BASE}/api/auth/login`
        : `${API_BASE}/api/auth/register`;

      const payload = tab === "login"
        ? { email: form.email, password: form.password }
        : { email: form.email, password: form.password, username: form.username };

      const res = await axios.post(url, payload);
      login(res.data.token, res.data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="auth-card" role="dialog" aria-modal="true">
        <div className="auth-card-header">
          <div className="auth-logo">
            <span className="auth-logo-dot" />
            <span className="auth-logo-name">blogger<span>LK</span></span>
          </div>
          <button className="auth-close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => switchTab("login")}>
            Login
          </button>
          <button className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => switchTab("register")}>
            Register
          </button>
        </div>

        <div className="auth-body">
          <h2 className="auth-title">
            {tab === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className="auth-subtitle">
            {tab === "login"
              ? "Sign in to manage your posts."
              : "Join bloggerLK and start writing today."}
          </p>

          {error && (
            <div className="auth-error">
              <i className="fa-solid fa-circle-exclamation" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {tab === "register" && (
              <div className="auth-field">
                <label htmlFor="am-username">Username</label>
                <input
                  id="am-username"
                  name="username"
                  type="text"
                  placeholder="Your name or handle"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="am-email">Email</label>
              <input
                id="am-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="auth-field">
              <label htmlFor="am-password">Password</label>
              <div className="auth-pw-wrapper">
                <input
                  id="am-password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  placeholder={tab === "register" ? "At least 6 characters" : "Your password"}
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete={tab === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  <i className={`fa-solid ${showPw ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
            </div>

            <button className="auth-submit-btn" type="submit" disabled={loading}>
              {loading && <span className="auth-spinner" />}
              {loading ? "Please wait…" : tab === "login" ? "Login" : "Create account"}
            </button>
          </form>

          <div className="auth-switch">
            {tab === "login" ? (
              <>Don't have an account?<button onClick={() => switchTab("register")}>Register</button></>
            ) : (
              <>Already have an account?<button onClick={() => switchTab("login")}>Login</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
