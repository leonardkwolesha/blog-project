import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../config/api";
import "./AuthModal.css";

export default function AuthModal({ onClose, defaultTab = "login" }) {
  const [tab, setTab]       = useState(defaultTab);
  const [form, setForm]     = useState({ email: "", password: "", username: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError]   = useState("");
  const [info, setInfo]     = useState("");   // non-blocking hint message
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

  const switchTab = (t, keepEmail = false) => {
    setTab(t);
    setError("");
    setInfo("");
    setShowPw(false);
    setForm((p) => ({
      email: keepEmail ? p.email : "",
      password: "",
      username: "",
    }));
  };

  /* ── Login / Register submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    // Capture tab value now — don't read it inside the async catch (stale closure risk)
    const isRegister       = tab === "register";
    const normalizedEmail  = form.email.trim().toLowerCase();

    try {
      const url     = isRegister ? `${API_BASE}/api/auth/register` : `${API_BASE}/api/auth/login`;
      const payload = isRegister
        ? { email: normalizedEmail, password: form.password, username: form.username.trim() }
        : { email: normalizedEmail, password: form.password };

      const res = await axios.post(url, payload);
      login(res.data.token, res.data.user);
      onClose();
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.message || "Something went wrong. Try again.";

      if (isRegister && status === 409) {
        // Stay on register — clear password so user can try a different email or fix theirs
        setForm((p) => ({ ...p, password: "" }));
        setError("duplicate-email");   // sentinel — rendered as a rich block below
        return;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── Forgot password submit ── */
  const handleForgot = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/auth/forgot-password`, { email: form.email.trim().toLowerCase() });
      setInfo("Check your inbox — we sent a reset link if that email is registered.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Forgot view ── */
  if (tab === "forgot") {
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

          <div className="auth-body">
            <button className="auth-back-link" onClick={() => switchTab("login")}>
              <i className="fa-solid fa-arrow-left" /> Back to login
            </button>

            <h2 className="auth-title" style={{ marginTop: "14px" }}>Forgot password?</h2>
            <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>

            {error && (
              <div className="auth-error">
                <i className="fa-solid fa-circle-exclamation" /> {error}
              </div>
            )}

            {info ? (
              <div className="auth-success">
                <i className="fa-solid fa-circle-check" /> {info}
              </div>
            ) : (
              <form onSubmit={handleForgot}>
                <div className="auth-field">
                  <label htmlFor="am-forgot-email">Email</label>
                  <input
                    id="am-forgot-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                </div>
                <button className="auth-submit-btn" type="submit" disabled={loading} style={{ marginTop: "8px" }}>
                  {loading && <span className="auth-spinner" />}
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Login / Register view ── */
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

          {/* Info banner (non-blocking, e.g. "already registered, log in") */}
          {info && (
            <div className="auth-info">
              <i className="fa-solid fa-circle-info" /> {info}
            </div>
          )}

          {error === "duplicate-email" ? (
            <div className="auth-error auth-error-dup">
              <i className="fa-solid fa-circle-exclamation" />
              <span>
                That email is already registered.{" "}
                <button type="button" className="auth-err-link" onClick={() => switchTab("login", true)}>
                  Log in
                </button>
                {" "}or{" "}
                <button type="button" className="auth-err-link" onClick={() => switchTab("forgot", true)}>
                  reset your password
                </button>
                , or use a different email.
              </span>
            </div>
          ) : error ? (
            <div className="auth-error">
              <i className="fa-solid fa-circle-exclamation" /> {error}
              {tab === "login" && (
                <button
                  type="button"
                  className="auth-forgot-inline"
                  onClick={() => switchTab("forgot", true)}
                >
                  Forgot password?
                </button>
              )}
            </div>
          ) : null}

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
              <div className="auth-pw-label-row">
                <label htmlFor="am-password">Password</label>
                {tab === "login" && (
                  <button
                    type="button"
                    className="auth-forgot-link"
                    onClick={() => switchTab("forgot", true)}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
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
