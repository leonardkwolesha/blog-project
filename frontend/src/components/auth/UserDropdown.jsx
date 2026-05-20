import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./UserDropdown.css";

export default function UserDropdown() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <div className="ud-wrap" ref={ref}>
      <button
        className="ud-avatar"
        onClick={() => setOpen((o) => !o)}
        aria-label="User menu"
        aria-expanded={open}
      >
        {user?.imageUrl ? (
          <img src={user.imageUrl} alt={user.username || "User"} className="ud-avatar-img" />
        ) : (
          <span className="ud-avatar-initials">{initials}</span>
        )}
      </button>

      {open && (
        <div className="ud-dropdown">
          <div className="ud-dropdown-header">
            <div className="ud-name">{user?.username || "Writer"}</div>
            <div className="ud-email">{user?.email}</div>
          </div>
          <div className="ud-divider" />
          <Link to="/dashboard" className="ud-item" onClick={() => setOpen(false)}>
            <i className="fa-solid fa-gauge" /> Dashboard
          </Link>
          <Link to="/settings" className="ud-item" onClick={() => setOpen(false)}>
            <i className="fa-solid fa-gear" /> Settings
          </Link>
          <div className="ud-divider" />
          <button className="ud-item ud-item-logout" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket" /> Logout
          </button>
        </div>
      )}
    </div>
  );
}
