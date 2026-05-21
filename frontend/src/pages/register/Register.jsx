import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../config/api";
import "../login/login.css";

export default function Register() {
  const { login, isLoaded, isSignedIn } = useAuth();
  const navigate                        = useNavigate();

  const [form, setForm]       = useState({ username: "", email: "", password: "" });
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  // Wait for localStorage to be read before deciding anything
  if (!isLoaded) return null;

  // Already signed in — send to dashboard
  if (isSignedIn) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/register`, {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      login(res.data.token, res.data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        setForm((p) => ({ ...p, password: "" }));   // clear password, keep email
        setError("duplicate-email");
      } else {
        setError(err.response?.data?.message || "Registration failed. Please try again.");
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

        {error === "duplicate-email" ? (
          <div className="auth-page-error" style={{ alignItems: "flex-start", lineHeight: 1.5 }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginTop: 2 }} />
            <span>
              That email is already registered.{" "}
              <Link to="/login" style={{ color: "#dc2626", fontWeight: 700 }}>Log in</Link>
              {" "}or{" "}
              <Link to="/forgot-password" style={{ color: "#dc2626", fontWeight: 700 }}>reset your password</Link>
              , or use a different email.
            </span>
          </div>
        ) : error ? (
          <div className="auth-page-error">
            <i className="fa-solid fa-circle-exclamation" /> {error}
          </div>
        ) : null}

        <form className="auth-page-form" onSubmit={handleSubmit} noValidate autoComplete="off">
          <div className="auth-page-field">
            <label htmlFor="rp-username">Username</label>
            <input
              id="rp-username"
              name="username"
              type="text"
              placeholder="Your name or handle"
              value={form.username}
              onChange={handleChange}
              autoFocus
              autoComplete="off"
            />
          </div>

          <div className="auth-page-field">
            <label htmlFor="rp-email">Email</label>
            <input
              id="rp-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>

          <div className="auth-page-field">
            <label htmlFor="rp-password">Password</label>
            <div className="auth-page-pw-wrapper">
              <input
                id="rp-password"
                name="password"
                type={showPw ? "text" : "password"}
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                required
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
