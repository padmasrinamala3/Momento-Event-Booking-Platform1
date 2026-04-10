import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { showToast } from "./Layout";

const NAV_LINKS = [
  { label: "Home", id: "home", icon: "🏠" },
  { label: "About", id: "about", icon: "✦" },
  { label: "Events", id: "events", icon: "🎉" },
  { label: "Calendar", id: "calendar", icon: "📅" },
  { label: "Gallery", id: "gallery", icon: "🖼" },
  { label: "Pricing", id: "pricing", icon: "💎" },
  { label: "My Account", id: "userAuth", icon: "👤" },
  { label: "Admin", id: "admin", icon: "⚙️" },
  { label: "Reviews", id: "rating", icon: "⭐" },
  { label: "Contact", id: "contact", icon: "📞" },
];

const Navbar = () => {
  const { loggedInUser, setLoggedInUser } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    showToast("✓ Logged out", "");
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="logo" onClick={() => navTo("home")}>Moment<span>O</span></div>
        <ul className="nav-links">
          {NAV_LINKS.map(l => (
            <li key={l.id}><button onClick={() => navTo(l.id)}>{l.label}</button></li>
          ))}
        </ul>
        <div className="nav-right">
          {loggedInUser && <div className="nav-user-badge">👤 {loggedInUser.name}</div>}
          {loggedInUser && <button className="nav-logout-btn" onClick={handleLogout}>Logout</button>}
          <button className={`hamburger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`mob-menu ${menuOpen ? "open" : ""}`}>
        {NAV_LINKS.map(l => (
          <button key={l.id} className="mob-link" onClick={() => navTo(l.id)}>
            <span className="ml-dot" />
            <span className="ml-icon">{l.icon}</span>
            {l.label}
          </button>
        ))}
      </div>
    </>
  );
};

export default Navbar;