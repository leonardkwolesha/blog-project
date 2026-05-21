import { useState } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../config/api";
import "./login.css";

export default function Login() {
  const location                    = useLocation();
  const { login, isLoaded, isSignedIn } = useAuth();
  const navigate                    = useNavigate();

  const [form, setForm]       = useState({ email: "", password: "" });
  const [showPw, setShowPw]   = useState(false);
  const [info, setInfo]       = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  // Wait for localStorage to be read before deciding anything
  if (!isLoaded) return null;

  // Already signed in — send to dashboard
  if (isSignedIn) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    setInfo("");  // clear info banner once user starts typing
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      login(res.data.token, res.data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
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

        {info && (
          <div className="auth-page-info">
            <i className="fa-solid fa-circle-info" /> {info}
          </div>
        )}

        {error && (
          <div className="auth-page-error">
            <i className="fa-solid fa-circle-exclamation" /> {error}
          </div>
        )}

        <form className="auth-page-form" onSubmit={handleSubmit} noValidate autoComplete="off">
          <div className="auth-page-field">
            <label htmlFor="lp-email">Email</label>
            <input
              id="lp-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoFocus
              autoComplete="off"
            />
          </div>

          <div className="auth-page-field">
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
