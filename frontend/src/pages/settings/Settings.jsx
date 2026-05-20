import { useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../config/api";
import "./settings.css";

export default function Settings() {
  const { user, token, updateUser } = useAuth();

  const [profile, setProfile] = useState({
    username: user?.username || "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });

  const [avatarPreview, setAvatarPreview] = useState(user?.imageUrl || "");
  const [avatarFile, setAvatarFile]     = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [profileMsg, setProfileMsg]   = useState(null);
  const [pwdMsg, setPwdMsg]           = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwdLoading, setPwdLoading]   = useState(false);

  const showMsg = (setter, text, type = "success") => {
    setter({ text, type });
    setTimeout(() => setter(null), 3500);
  };

  const togglePw = (key) => setShowPw((p) => ({ ...p, [key]: !p[key] }));

  /* ── Avatar ─────────────────────────────── */
  const handleAvatarPick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarLoading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", avatarFile);
      const res = await axios.post(`${API_BASE}/api/users/avatar`, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      updateUser(res.data.data);
      setAvatarFile(null);
      showMsg(setProfileMsg, "Profile picture updated.");
    } catch (err) {
      showMsg(setProfileMsg, err.response?.data?.message || "Upload failed.", "error");
    } finally {
      setAvatarLoading(false);
    }
  };

  /* ── Profile text ───────────────────────── */
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await axios.put(
        `${API_BASE}/api/users/me`,
        { username: profile.username },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateUser(res.data.data);
      showMsg(setProfileMsg, "Profile updated successfully.");
    } catch (err) {
      showMsg(setProfileMsg, err.response?.data?.message || "Update failed.", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  /* ── Password ───────────────────────────── */
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      showMsg(setPwdMsg, "New passwords do not match.", "error");
      return;
    }
    if (passwords.newPassword.length < 6) {
      showMsg(setPwdMsg, "Password must be at least 6 characters.", "error");
      return;
    }
    setPwdLoading(true);
    try {
      await axios.put(
        `${API_BASE}/api/users/password`,
        { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showMsg(setPwdMsg, "Password changed successfully.");
    } catch (err) {
      showMsg(setPwdMsg, err.response?.data?.message || "Password change failed.", "error");
    } finally {
      setPwdLoading(false);
    }
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <div className="settings-page">
      <div className="settings-wrap">

        {/* ── Header card ── */}
        <div className="settings-header">
          <div className="settings-avatar-wrap">
            <div
              className="settings-avatar"
              onClick={() => fileInputRef.current?.click()}
              title="Click to change photo"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" />
              ) : (
                <span className="settings-initials">{initials}</span>
              )}
              <div className="settings-avatar-overlay">
                <i className="fa-solid fa-camera" />
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={handleAvatarPick}
            />

            {avatarFile && (
              <button
                className="settings-upload-btn"
                onClick={handleAvatarUpload}
                disabled={avatarLoading}
              >
                {avatarLoading
                  ? <><span className="settings-spinner" />Uploading…</>
                  : <><i className="fa-solid fa-cloud-arrow-up" />Save photo</>}
              </button>
            )}
          </div>

          <div>
            <h1 className="settings-title">Account Settings</h1>
            <p className="settings-email">{user?.email}</p>
            <p className="settings-avatar-hint">Click your photo to change it</p>
          </div>
        </div>

        {/* ── Profile section ── */}
        <div className="settings-section">
          <h2 className="settings-section-title">Profile</h2>

          {profileMsg && (
            <div className={`settings-msg settings-msg-${profileMsg.type}`}>
              <i className={`fa-solid ${profileMsg.type === "success" ? "fa-circle-check" : "fa-circle-exclamation"}`} />
              {profileMsg.text}
            </div>
          )}

          <form className="settings-form" onSubmit={handleProfileSubmit}>
            <div className="settings-field">
              <label htmlFor="s-username">Username</label>
              <input
                id="s-username" name="username" type="text"
                value={profile.username}
                onChange={(e) => setProfile({ username: e.target.value })}
                placeholder="Your display name"
              />
            </div>
            <button className="settings-btn" type="submit" disabled={profileLoading}>
              {profileLoading && <span className="settings-spinner" />}
              {profileLoading ? "Saving…" : "Save profile"}
            </button>
          </form>
        </div>

        {/* ── Password section ── */}
        <div className="settings-section">
          <h2 className="settings-section-title">Change Password</h2>

          {pwdMsg && (
            <div className={`settings-msg settings-msg-${pwdMsg.type}`}>
              <i className={`fa-solid ${pwdMsg.type === "success" ? "fa-circle-check" : "fa-circle-exclamation"}`} />
              {pwdMsg.text}
            </div>
          )}

          <form className="settings-form" onSubmit={handlePasswordSubmit}>
            <div className="settings-field">
              <label htmlFor="s-current">Current password</label>
              <div className="s-pw-wrapper">
                <input
                  id="s-current" name="currentPassword"
                  type={showPw.current ? "text" : "password"}
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                  placeholder="Current password" required
                />
                <button type="button" className="s-pw-toggle" onClick={() => togglePw("current")}
                  aria-label={showPw.current ? "Hide" : "Show"} tabIndex={-1}>
                  <i className={`fa-solid ${showPw.current ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
            </div>

            <div className="settings-field">
              <label htmlFor="s-new">New password</label>
              <div className="s-pw-wrapper">
                <input
                  id="s-new" name="newPassword"
                  type={showPw.newPw ? "text" : "password"}
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                  placeholder="At least 6 characters" required
                />
                <button type="button" className="s-pw-toggle" onClick={() => togglePw("newPw")}
                  aria-label={showPw.newPw ? "Hide" : "Show"} tabIndex={-1}>
                  <i className={`fa-solid ${showPw.newPw ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
            </div>

            <div className="settings-field">
              <label htmlFor="s-confirm">Confirm new password</label>
              <div className="s-pw-wrapper">
                <input
                  id="s-confirm" name="confirmPassword"
                  type={showPw.confirm ? "text" : "password"}
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Repeat new password" required
                />
                <button type="button" className="s-pw-toggle" onClick={() => togglePw("confirm")}
                  aria-label={showPw.confirm ? "Hide" : "Show"} tabIndex={-1}>
                  <i className={`fa-solid ${showPw.confirm ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
            </div>

            <button className="settings-btn" type="submit" disabled={pwdLoading}>
              {pwdLoading && <span className="settings-spinner" />}
              {pwdLoading ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
