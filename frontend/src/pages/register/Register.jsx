import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../config/api";
import "../login/login.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { login, isLoaded, isSignedIn } = useAuth();

  const [form, setForm]       = useState({ username: "", email: "", password: "" });
  const [touched, setTouched] = useState({ username: false, email: false, password: false });
  const [showPw, setShowPw]   = useState(false);
  const [serverError, setServerError] = useState("");
  const [emailTaken, setEmailTaken]   = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isLoaded) return null;
  if (isSignedIn) return <Navigate to="/dashboard" replace />;

  // Compute field errors only for touched fields
  const fieldErrors = {};
  if (touched.username && !form.username.trim()) {
    fieldErrors.username = "Username is required.";
  }
  if (touched.email) {
    if (!form.email.trim())                      fieldErrors.email = "Email is required.";
    else if (!EMAIL_RE.test(form.email.trim()))  fieldErrors.email = "Enter a valid email address.";
    else if (emailTaken)                         fieldErrors.email = "taken";
  }
  if (touched.password) {
    if (!form.password)                fieldErrors.password = "Password is required.";
    else if (form.password.length < 6) fieldErrors.password = "Password must be at least 6 characters.";
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setServerError("");
    if (name === "email") setEmailTaken(false);
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleBlur = (e) => setTouched((p) => ({ ...p, [e.target.name]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Touch all fields so errors become visible
    setTouched({ username: true, email: true, password: true });

    const email    = form.email.trim().toLowerCase();
    const username = form.username.trim();
    if (!username || !email || !EMAIL_RE.test(email) || form.password.length < 6) return;

    setServerError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/register`, {
        username,
        email,
        password: form.password,
      });
      login(res.data.token, res.data.user);
      // Navigation handled by the isSignedIn guard at the top of this component
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        setEmailTaken(true);
        setForm((p) => ({ ...p, password: "" }));
      } else {
        setServerError(err.response?.data?.message || "Registration failed. Please try again.");
      }
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

        <h1 className="auth-page-title">Create account</h1>
        <p className="auth-page-sub">Join bloggerLK and start writing today.</p>

        {serverError && (
          <div className="auth-page-error">
            <i className="fa-solid fa-circle-exclamation" /> {serverError}
          </div>
        )}

        <form className="auth-page-form" onSubmit={handleSubmit} noValidate autoComplete="off">

          {/* Username */}
          <div className={`auth-page-field${fieldErrors.username ? " has-error" : ""}`}>
            <label htmlFor="rp-username">Username</label>
            <input
              id="rp-username"
              name="username"
              type="text"
              placeholder="Your name or handle"
              value={form.username}
              onChange={handleChange}
              onBlur={handleBlur}
              autoFocus
              autoComplete="off"
            />
            {fieldErrors.username && (
              <span className="auth-field-error">{fieldErrors.username}</span>
            )}
          </div>

          {/* Email */}
          <div className={`auth-page-field${fieldErrors.email ? " has-error" : ""}`}>
            <label htmlFor="rp-email">Email</label>
            <input
              id="rp-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="off"
            />
            {fieldErrors.email === "taken" ? (
              <span className="auth-field-error">
                Email already registered.{" "}
                <Link to="/login" className="auth-field-err-link">Log in</Link>
                {" "}or{" "}
                <Link to="/forgot-password" className="auth-field-err-link">reset password</Link>.
              </span>
            ) : fieldErrors.email ? (
              <span className="auth-field-error">{fieldErrors.email}</span>
            ) : null}
          </div>

          {/* Password */}
          <div className={`auth-page-field${fieldErrors.password ? " has-error" : ""}`}>
            <label htmlFor="rp-password">Password</label>
            <div className="auth-page-pw-wrapper">
              <input
                id="rp-password"
                name="password"
                type={showPw ? "text" : "password"}
                placeholder="At least 6 characters"
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
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="auth-page-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
