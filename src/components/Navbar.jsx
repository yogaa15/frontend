import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("beranda");

  // Track active section based on scroll position on Beranda
  useEffect(() => {
    if (location.pathname === "/" || location.pathname.startsWith("/sewa")) {
      const handleScroll = () => {
        const katalogEl = document.getElementById("katalog-mobil");
        if (katalogEl) {
          const rect = katalogEl.getBoundingClientRect();
          // If the catalog is near or past the top of the viewport
          if (rect.top <= 250) {
            setActiveSection("sewa");
          } else {
            setActiveSection("beranda");
          }
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setActiveSection("");
    }
  }, [location.pathname]);

  const handleNavBeranda = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNavSewaMobil = (e) => {
    e.preventDefault();
    if (location.pathname === "/" || location.pathname.startsWith("/sewa")) {
      const el = document.getElementById("katalog-mobil");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/#katalog-mobil");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "US";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const isHome = location.pathname === "/" || location.pathname.startsWith("/sewa");

  return (
    <header className="navbar-header">
      <nav className="navbar">
        <Link to="/" onClick={handleNavBeranda} className="logo-container">
          <div className="logo-brand-mark">
            <span className="logo-icon">✦</span>
          </div>
          <div className="logo-text">
            <span className="wordmark">Selaras</span>
            <span className="tagline-logo">RENTAL MOBIL PREMIUM</span>
          </div>
        </Link>

        <ul className="navbar-menu">
          <li>
            <NavLink
              to="/"
              end
              onClick={handleNavBeranda}
              className={() =>
                isHome && activeSection === "beranda" ? "active" : ""
              }
            >
              Beranda
            </NavLink>
          </li>
          <li>
            <a
              href="#katalog-mobil"
              onClick={handleNavSewaMobil}
              className={
                isHome && activeSection === "sewa" ? "active" : ""
              }
            >
              Sewa Mobil
            </a>
          </li>
          <li>
            <NavLink
              to="/riwayat"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Riwayat Pesanan
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/pembayaran"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Pembayaran
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/tentang"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Tentang Kami
            </NavLink>
          </li>
        </ul>

        <div className="navbar-auth">
          {/* Tombol Pengalih Mode Gelap / Terang */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={isDark ? "Beralih ke Mode Terang (Light Mode)" : "Beralih ke Mode Gelap (Dark Mode)"}
            aria-label="Toggle Theme"
          >
            <span className="theme-toggle-icon">{isDark ? "☀️" : "🌙"}</span>
            <span className="theme-toggle-text">{isDark ? "Mode Terang" : "Mode Gelap"}</span>
          </button>

          {isAuthenticated ? (
            <div className="navbar-user-logged">
              <NavLink
                to="/riwayat"
                className={({ isActive }) =>
                  `nav-orders-shortcut ${isActive ? "active" : ""}`
                }
                title="Riwayat Pesanan Saya"
              >
                📋 Pesanan Saya
              </NavLink>
              <span className="navbar-user-greeting">
                Halo, <strong>{user?.name || "Pelanggan"}</strong>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="nav-logout-btn"
                title="Keluar dari akun"
              >
                Keluar
              </button>
              <Link
                to={user?.role === "admin" ? "/admin/dashboard" : "/riwayat"}
                title={user?.role === "admin" ? "Admin Dashboard" : "Riwayat Pesanan Saya"}
                className="avatar-account"
              >
                {getInitials(user?.name || "Pelanggan")}
              </Link>
            </div>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `nav-auth-link ${isActive ? "active" : ""}`}>
                Masuk
              </NavLink>
              <NavLink to="/register" className="nav-btn-gold">
                Daftar
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
