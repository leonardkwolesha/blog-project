import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../config/api";
import "../login/login.css";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
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
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/register`, form);
      login(res.data.token, res.data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
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

        {error && (
          <div className="auth-page-error">
            <i className="fa-solid fa-circle-exclamation" /> {error}
          </div>
        )}

        <form className="auth-page-form" onSubmit={handleSubmit}>
          <div className="auth-page-field">
            <label htmlFor="rp-username">Username</label>
            <input
              id="rp-username" name="username" type="text"
              placeholder="Your name or handle"
              value={form.username} onChange={handleChange}
              autoFocus
            />
          </div>
          <div className="auth-page-field">
            <label htmlFor="rp-email">Email</label>
            <input
              id="rp-email" name="email" type="email"
              placeholder="you@example.com"
              value={form.email} onChange={handleChange}
              required
            />
          </div>
          <div className="auth-page-field">
            <label htmlFor="rp-password">Password</label>
            <input
              id="rp-password" name="password" type="password"
              placeholder="At least 6 characters"
              value={form.password} onChange={handleChange}
              required
            />
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
