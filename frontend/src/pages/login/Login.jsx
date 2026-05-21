import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../config/api";
import "./login.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login, isLoaded, isSignedIn } = useAuth();

  const [form, setForm]       = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [showPw, setShowPw]   = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isLoaded) return null;
  if (isSignedIn) return <Navigate to="/dashboard" replace />;

  // Compute field errors only for touched fields
  const fieldErrors = {};
  if (touched.email) {
    if (!form.email.trim())                      fieldErrors.email = "Email is required.";
    else if (!EMAIL_RE.test(form.email.trim()))  fieldErrors.email = "Enter a valid email address.";
  }
  if (touched.password && !form.password) {
    fieldErrors.password = "Password is required.";
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setServerError("");
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleBlur = (e) => setTouched((p) => ({ ...p, [e.target.name]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Touch all fields so errors become visible
    setTouched({ email: true, password: true });

    const email = form.email.trim();
    if (!email || !EMAIL_RE.test(email) || !form.password) return;

    setServerError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, {
        email: email.toLowerCase(),
        password: form.password,
      });
      login(res.data.token, res.data.user);
      // Navigation handled by the isSignedIn guard at the top of this component
    } catch (err) {
      setServerError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page-card">
        <div className="auth-page-logo">
          <span className="auth-page-dot" />
          <span className="auth-page-brand">blogger<span>LK</span></span>
        </div>

        <h1 className="auth-page-title">Welcome back</h1>
        <p className="auth-page-sub">Sign in to manage your posts.</p>

        {serverError && (
          <div className="auth-page-error">
            <i className="fa-solid fa-circle-exclamation" /> {serverError}
          </div>
        )}

        <form className="auth-page-form" onSubmit={handleSubmit} noValidate autoComplete="off">

          {/* Email */}
          <div className={`auth-page-field${fieldErrors.email ? " has-error" : ""}`}>
            <label htmlFor="lp-email">Email</label>
            <input
              id="lp-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              autoFocus
              autoComplete="off"
            />
            {fieldErrors.email && (
              <span className="auth-field-error">{fieldErrors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className={`auth-page-field${fieldErrors.password ? " has-error" : ""}`}>
            <div className="auth-page-pw-label-row">
              <label htmlFor="lp-password">Password</label>
              <Link to="/forgot-password" className="auth-page-forgot">Forgot password?</Link>
            </div>
            <div className="auth-page-pw-wrapper">
              <input
                id="lp-password"
                name="password"
                type={showPw ? "text" : "password"}
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="off"
              />
              <button
                type="button"
                className="auth-page-pw-toggle"
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

          <button className="auth-page-btn" type="submit" disabled={loading}>
            {loading && <span className="auth-page-spinner" />}
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>

        <p className="auth-page-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
