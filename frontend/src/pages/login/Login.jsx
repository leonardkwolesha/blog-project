import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../config/api";
import "./login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isSignedIn } = useAuth();
  const navigate = useNavigate();

  if (isSignedIn) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, form);
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

        {error && (
          <div className="auth-page-error">
            <i className="fa-solid fa-circle-exclamation" /> {error}
          </div>
        )}

        <form className="auth-page-form" onSubmit={handleSubmit}>
          <div className="auth-page-field">
            <label htmlFor="lp-email">Email</label>
            <input
              id="lp-email" name="email" type="email"
              placeholder="you@example.com"
              value={form.email} onChange={handleChange}
              required autoFocus
            />
          </div>
          <div className="auth-page-field">
            <label htmlFor="lp-password">Password</label>
            <input
              id="lp-password" name="password" type="password"
              placeholder="Your password"
              value={form.password} onChange={handleChange}
              required
            />
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
