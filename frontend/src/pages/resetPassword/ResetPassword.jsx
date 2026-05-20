import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../../config/api";
import "../login/login.css";
import "./resetPassword.css";

export default function ResetPassword() {
  const [searchParams]  = useSearchParams();
  const token           = searchParams.get("token") || "";
  const navigate        = useNavigate();

  const [form, setForm]   = useState({ newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState({ new: false, confirm: false });
  const [error, setError]   = useState("");
  const [done, setDone]     = useState(false);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-page-card">
          <div className="rp-invalid">
            <i className="fa-solid fa-link-slash rp-invalid-icon" />
            <h2>Invalid reset link</h2>
            <p>This link is missing a token. Please request a new one.</p>
            <Link to="/forgot-password" className="auth-page-btn" style={{ textDecoration: "none", justifyContent: "center", display: "flex" }}>
              Request new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const togglePw = (key) =>
    setShowPw((p) => ({ ...p, [key]: !p[key] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/auth/reset-password`, {
        token,
        newPassword: form.newPassword,
      });
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-page-card" style={{ textAlign: "center" }}>
          <div className="rp-done-icon">
            <i className="fa-solid fa-circle-check" />
          </div>
          <h1 className="auth-page-title">Password reset!</h1>
          <p className="auth-page-sub">Redirecting you to login in a moment…</p>
          <Link to="/login" className="auth-page-btn" style={{ textDecoration: "none", justifyContent: "center", display: "flex" }}>
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-page-card">
        <div className="auth-page-logo">
          <span className="auth-page-dot" />
          <span className="auth-page-brand">blogger<span>LK</span></span>
        </div>

        <h1 className="auth-page-title">Set new password</h1>
        <p className="auth-page-sub">Choose a strong password for your account.</p>

        {error && (
          <div className="auth-page-error">
            <i className="fa-solid fa-circle-exclamation" /> {error}
          </div>
        )}

        <form className="auth-page-form" onSubmit={handleSubmit}>
          <div className="auth-page-field">
            <label htmlFor="rp-new">New password</label>
            <div className="auth-page-pw-wrapper">
              <input
                id="rp-new" name="newPassword"
                type={showPw.new ? "text" : "password"}
                placeholder="At least 6 characters"
                value={form.newPassword} onChange={handleChange}
                required autoFocus
              />
              <button type="button" className="auth-page-pw-toggle"
                onClick={() => togglePw("new")} tabIndex={-1}
                aria-label={showPw.new ? "Hide" : "Show"}>
                <i className={`fa-solid ${showPw.new ? "fa-eye-slash" : "fa-eye"}`} />
              </button>
            </div>
          </div>

          <div className="auth-page-field">
            <label htmlFor="rp-confirm">Confirm password</label>
            <div className="auth-page-pw-wrapper">
              <input
                id="rp-confirm" name="confirmPassword"
                type={showPw.confirm ? "text" : "password"}
                placeholder="Repeat new password"
                value={form.confirmPassword} onChange={handleChange}
                required
              />
              <button type="button" className="auth-page-pw-toggle"
                onClick={() => togglePw("confirm")} tabIndex={-1}
                aria-label={showPw.confirm ? "Hide" : "Show"}>
                <i className={`fa-solid ${showPw.confirm ? "fa-eye-slash" : "fa-eye"}`} />
              </button>
            </div>
          </div>

          <button className="auth-page-btn" type="submit" disabled={loading}>
            {loading && <span className="auth-page-spinner" />}
            {loading ? "Resetting…" : "Reset password"}
          </button>
        </form>

        <p className="auth-page-switch">
          Remember your password? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
