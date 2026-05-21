import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../../config/api";
import "../login/login.css";
import "./resetPassword.css";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token    = params.get("token") || "";

  const [form, setForm]       = useState({ password: "", confirm: "" });
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const [showPw, setShowPw]   = useState(false);
  const [showCf, setShowCf]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [serverError, setServerError] = useState("");

  // Computed field errors — only shown after the field is touched
  const fieldErrors = {};
  if (touched.password) {
    if (!form.password)                fieldErrors.password = "Password is required.";
    else if (form.password.length < 6) fieldErrors.password = "Password must be at least 6 characters.";
  }
  if (touched.confirm) {
    if (!form.confirm)                       fieldErrors.confirm = "Please confirm your password.";
    else if (form.confirm !== form.password) fieldErrors.confirm = "Passwords do not match.";
  }

  /* ── No token in URL ── */
  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-page-card">
          <Logo />
          <div className="rp-invalid">
            <i className="fa-solid fa-link-slash rp-invalid-icon" />
            <h2>Invalid reset link</h2>
            <p>This link is missing or broken. Request a fresh one below.</p>
            <Link to="/forgot-password" className="auth-page-btn" style={{ textDecoration: "none" }}>
              Request new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Success state ── */
  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-page-card" style={{ textAlign: "center" }}>
          <Logo />
          <i className="fa-solid fa-circle-check rp-done-icon" />
          <h1 className="auth-page-title">Password reset!</h1>
          <p className="auth-page-sub" style={{ marginBottom: "24px" }}>
            Your password has been updated. You can now log in with your new password.
          </p>
          <Link
            to="/login"
            className="auth-page-btn"
            style={{ textDecoration: "none", display: "flex", justifyContent: "center" }}
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setServerError("");
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleBlur = (e) => {
    setTouched((p) => ({ ...p, [e.target.name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ password: true, confirm: true });

    // Client-side gate — don't hit the server if the form is invalid
    if (!form.password || form.password.length < 6) return;
    if (form.confirm !== form.password) return;

    setServerError("");
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/auth/reset-password`, {
        token,
        newPassword: form.password,
      });
      setDone(true);
    } catch (err) {
      setServerError(err.response?.data?.message || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  const isExpiredOrInvalid =
    serverError.toLowerCase().includes("invalid") ||
    serverError.toLowerCase().includes("expired");

  return (
    <div className="auth-page">
      <div className="auth-page-card">
        <Logo />

        <h1 className="auth-page-title">Set new password</h1>
        <p className="auth-page-sub">Choose a strong password for your account.</p>

        {serverError && (
          <div className="auth-page-error">
            <i className="fa-solid fa-circle-exclamation" />
            <span>
              {serverError}
              {isExpiredOrInvalid && (
                <>
                  {" "}—{" "}
                  <Link to="/forgot-password" style={{ color: "#dc2626", fontWeight: 700 }}>
                    Request a new link
                  </Link>
                </>
              )}
            </span>
          </div>
        )}

        <form className="auth-page-form" onSubmit={handleSubmit} noValidate>
          {/* New password */}
          <div className={`auth-page-field${fieldErrors.password ? " has-error" : ""}`}>
            <label htmlFor="rp-password">New Password</label>
            <div className="auth-page-pw-wrapper">
              <input
                id="rp-password"
                name="password"
                type={showPw ? "text" : "password"}
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                autoFocus
                autoComplete="new-password"
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

          {/* Confirm password */}
          <div className={`auth-page-field${fieldErrors.confirm ? " has-error" : ""}`}>
            <label htmlFor="rp-confirm">Confirm Password</label>
            <div className="auth-page-pw-wrapper">
              <input
                id="rp-confirm"
                name="confirm"
                type={showCf ? "text" : "password"}
                placeholder="Repeat your new password"
                value={form.confirm}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-page-pw-toggle"
                onClick={() => setShowCf((v) => !v)}
                aria-label={showCf ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                <i className={`fa-solid ${showCf ? "fa-eye-slash" : "fa-eye"}`} />
              </button>
            </div>
            {fieldErrors.confirm && (
              <span className="auth-field-error">{fieldErrors.confirm}</span>
            )}
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

function Logo() {
  return (
    <div className="auth-page-logo">
      <span className="auth-page-dot" />
      <span className="auth-page-brand">
        blogger<span>LK</span>
      </span>
    </div>
  );
}
