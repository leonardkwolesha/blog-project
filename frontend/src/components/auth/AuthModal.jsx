import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../config/api";
import "./AuthModal.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthModal({ onClose, defaultTab = "login" }) {
  const [tab, setTab]       = useState(defaultTab);
  const [form, setForm]     = useState({ email: "", password: "", username: "" });
  const [touched, setTouched] = useState({ email: false, password: false, username: false });
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState("");
  const [info, setInfo]     = useState("");
  const [loading, setLoading] = useState(false);
  const [emailTaken, setEmailTaken] = useState(false);
  const { login } = useAuth();
  const navigate   = useNavigate();
  const overlayRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Inline field errors — only shown for touched fields
  const fieldErrors = {};
  if (tab === "register" && touched.username && !form.username.trim()) {
    fieldErrors.username = "Username is required.";
  }
  if (touched.email) {
    if (!form.email.trim())                      fieldErrors.email = "Email is required.";
    else if (!EMAIL_RE.test(form.email.trim()))  fieldErrors.email = "Enter a valid email address.";
    else if (emailTaken)                         fieldErrors.email = "taken";
  }
  if (touched.password) {
    if (!form.password) {
      fieldErrors.password = "Password is required.";
    } else if (tab === "register" && form.password.length < 6) {
      fieldErrors.password = "Password must be at least 6 characters.";
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setServerError("");
    if (name === "email") setEmailTaken(false);
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleBlur = (e) => {
    setTouched((p) => ({ ...p, [e.target.name]: true }));
  };

  const switchTab = (t, keepEmail = false) => {
    setTab(t);
    setServerError("");
    setInfo("");
    setShowPw(false);
    setEmailTaken(false);
    setTouched({ email: false, password: false, username: false });
    setForm((p) => ({
      email: keepEmail ? p.email : "",
      password: "",
      username: "",
    }));
  };

  /* ── Login / Register submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Touch all fields to reveal any hidden errors
    setTouched({ email: true, password: true, username: true });

    const email      = form.email.trim();
    const isRegister = tab === "register";

    // Client-side gate — don't hit the server if the form is invalid
    if (!email || !EMAIL_RE.test(email)) return;
    if (!form.password) return;
    if (isRegister && form.password.length < 6) return;
    if (isRegister && !form.username.trim()) return;

    setServerError("");
    setLoading(true);

    const normalizedEmail = email.toLowerCase();

    try {
      const url     = isRegister ? `${API_BASE}/api/auth/register` : `${API_BASE}/api/auth/login`;
      const payload = isRegister
        ? { email: normalizedEmail, password: form.password, username: form.username.trim() }
        : { email: normalizedEmail, password: form.password };

      const res = await axios.post(url, payload);
      login(res.data.token, res.data.user);
      onClose();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.message || "Something went wrong. Try again.";

      if (isRegister && status === 409) {
        // Show email-taken error inline under the email field
        setEmailTaken(true);
        setTouched((p) => ({ ...p, email: true }));
        setForm((p) => ({ ...p, password: "" }));
        return;
      }

      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── Forgot password submit ── */
  const handleForgot = async (e) => {
    e.preventDefault();
    setServerError("");
    setInfo("");
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/auth/forgot-password`, {
        email: form.email.trim().toLowerCase(),
      });
      setInfo("Check your inbox — we sent a reset link if that email is registered.");
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to send reset email. Try again.");
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

            {serverError && (
              <div className="auth-error">
                <i className="fa-solid fa-circle-exclamation" /> {serverError}
              </div>
            )}

            {info ? (
              <>
                <div className="auth-success">
                  <i className="fa-solid fa-circle-check" /> {info}
                </div>
                <button
                  className="auth-submit-btn"
                  type="button"
                  onClick={() => switchTab("login")}
                  style={{ marginTop: "12px" }}
                >
                  Back to login
                </button>
              </>
            ) : (
              <form onSubmit={handleForgot} autoComplete="off" noValidate>
                <div className="auth-field">
                  <label htmlFor="am-forgot-email">Email</label>
                  <input
                    id="am-forgot-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    autoFocus
                  />
                </div>
                <button
                  className="auth-submit-btn"
                  type="submit"
                  disabled={loading}
                  style={{ marginTop: "8px" }}
                >
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
          <button
            className={`auth-tab ${tab === "login" ? "active" : ""}`}
            onClick={() => switchTab("login")}
          >
            Login
          </button>
          <button
            className={`auth-tab ${tab === "register" ? "active" : ""}`}
            onClick={() => switchTab("register")}
          >
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

          {/* Server-level error banner (not field-specific) */}
          {serverError && (
            <div className="auth-error">
              <i className="fa-solid fa-circle-exclamation" />
              <span>
                {serverError}
                {tab === "login" && (
                  <button
                    type="button"
                    className="auth-forgot-inline"
                    onClick={() => switchTab("forgot", true)}
                  >
                    Forgot password?
                  </button>
                )}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" noValidate>

            {/* Username (register only) */}
            {tab === "register" && (
              <div className={`auth-field${fieldErrors.username ? " has-error" : ""}`}>
                <label htmlFor="am-username">Username</label>
                <input
                  id="am-username"
                  name="username"
                  type="text"
                  placeholder="Your name or handle"
                  value={form.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="off"
                />
                {fieldErrors.username && (
                  <span className="auth-field-error">{fieldErrors.username}</span>
                )}
              </div>
            )}

            {/* Email */}
            <div className={`auth-field${fieldErrors.email ? " has-error" : ""}`}>
              <label htmlFor="am-email">Email</label>
              <input
                id="am-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="off"
                autoFocus
              />
              {fieldErrors.email === "taken" ? (
                <span className="auth-field-error">
                  Email already registered.{" "}
                  <button
                    type="button"
                    className="auth-field-err-link"
                    onClick={() => switchTab("login", true)}
                  >
                    Log in
                  </button>
                  {" "}or{" "}
                  <button
                    type="button"
                    className="auth-field-err-link"
                    onClick={() => switchTab("forgot", true)}
                  >
                    reset password
                  </button>.
                </span>
              ) : fieldErrors.email ? (
                <span className="auth-field-error">{fieldErrors.email}</span>
              ) : null}
            </div>

            {/* Password */}
            <div className={`auth-field${fieldErrors.password ? " has-error" : ""}`}>
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
                  onBlur={handleBlur}
                  autoComplete="off"
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
              {fieldErrors.password && (
                <span className="auth-field-error">{fieldErrors.password}</span>
              )}
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
