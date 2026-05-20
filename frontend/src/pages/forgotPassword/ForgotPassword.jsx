import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../../config/api";
import "../login/login.css";

export default function ForgotPassword() {
  const [email, setEmail]     = useState("");
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/auth/forgot-password`, { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email. Try again.");
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

        {sent ? (
          <>
            <div className="fp-success-icon">
              <i className="fa-solid fa-envelope-circle-check" />
            </div>
            <h1 className="auth-page-title">Check your inbox</h1>
            <p className="auth-page-sub" style={{ marginBottom: "24px" }}>
              If <strong>{email}</strong> is registered, you'll receive a reset link shortly.
              The link expires in 1 hour.
            </p>
            <Link to="/login" className="auth-page-btn" style={{ textDecoration: "none", justifyContent: "center", display: "flex" }}>
              Back to login
            </Link>
          </>
        ) : (
          <>
            <h1 className="auth-page-title">Forgot password?</h1>
            <p className="auth-page-sub">Enter your email and we'll send you a reset link.</p>

            {error && (
              <div className="auth-page-error">
                <i className="fa-solid fa-circle-exclamation" /> {error}
              </div>
            )}

            <form className="auth-page-form" onSubmit={handleSubmit}>
              <div className="auth-page-field">
                <label htmlFor="fp-email">Email</label>
                <input
                  id="fp-email" type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required autoFocus
                />
              </div>
              <button className="auth-page-btn" type="submit" disabled={loading}>
                {loading && <span className="auth-page-spinner" />}
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>

            <p className="auth-page-switch">
              Remember your password? <Link to="/login">Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
