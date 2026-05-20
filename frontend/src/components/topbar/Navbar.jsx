import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import "./navbar.css";

export default function Navbar({ navLinks, isScrolled }) {
  return (
    <div className="nav-links-container">

      {navLinks.map((link, i) => (
        <Link
          key={i}
          to={link.path}
          className={`nav-link ${isScrolled ? "scrolled" : ""}`}
        >
          {link.name}
          <span className="nav-underline"></span>
        </Link>
      ))}

      <SignedOut>
        <Link to="/sign-in" className={`nav-link ${isScrolled ? "scrolled" : ""}`}>
          Login
          <span className="nav-underline"></span>
        </Link>
      </SignedOut>

      <SignedIn>
        <div className="user-button-wrapper">
          <UserButton afterSignOutUrl="/" />
        </div>
      </SignedIn>

    </div>
  );
}
