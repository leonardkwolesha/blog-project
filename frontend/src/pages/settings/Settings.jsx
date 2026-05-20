import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../config/api";
import "./settings.css";

export default function Settings() {
  const { user, token, updateUser } = useAuth();

  const [profile, setProfile] = useState({
    username: user?.username || "",
    imageUrl: user?.imageUrl || "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileMsg, setProfileMsg] = useState(null);
  const [pwdMsg, setPwdMsg] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const showMsg = (setter, text, type = "success") => {
    setter({ text, type });
    setTimeout(() => setter(null), 3500);
  };

  const handleProfileChange = (e) =>
    setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handlePasswordChange = (e) =>
    setPasswords((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await axios.put(
        `${API_BASE}/api/users/me`,
        { username: profile.username, imageUrl: profile.imageUrl },
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
        <div className="settings-header">
          <div className="settings-avatar">
            {profile.imageUrl ? (
              <img src={profile.imageUrl} alt="avatar" />
            ) : (
              <span className="settings-initials">{initials}</span>
            )}
          </div>
          <div>
            <h1 className="settings-title">Account Settings</h1>
            <p className="settings-email">{user?.email}</p>
          </div>
        </div>

        {/* Profile section */}
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
                value={profile.username} onChange={handleProfileChange}
                placeholder="Your display name"
              />
            </div>
            <div className="settings-field">
              <label htmlFor="s-imageUrl">Profile picture URL</label>
              <input
                id="s-imageUrl" name="imageUrl" type="url"
                value={profile.imageUrl} onChange={handleProfileChange}
                placeholder="https://example.com/avatar.jpg"
              />
              <p className="settings-hint">Paste a direct image link to set your avatar.</p>
            </div>
            <button className="settings-btn" type="submit" disabled={profileLoading}>
              {profileLoading && <span className="settings-spinner" />}
              {profileLoading ? "Saving…" : "Save profile"}
            </button>
          </form>
        </div>

        {/* Password section */}
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
              <input
                id="s-current" name="currentPassword" type="password"
                value={passwords.currentPassword} onChange={handlePasswordChange}
                placeholder="Current password" required
              />
            </div>
            <div className="settings-field">
              <label htmlFor="s-new">New password</label>
              <input
                id="s-new" name="newPassword" type="password"
                value={passwords.newPassword} onChange={handlePasswordChange}
                placeholder="At least 6 characters" required
              />
            </div>
            <div className="settings-field">
              <label htmlFor="s-confirm">Confirm new password</label>
              <input
                id="s-confirm" name="confirmPassword" type="password"
                value={passwords.confirmPassword} onChange={handlePasswordChange}
                placeholder="Repeat new password" required
              />
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
