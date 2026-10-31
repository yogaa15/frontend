// src/components/AdminSidebar.jsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate("/login", {
      state: { message: "Anda telah berhasil keluar dari akun Admin." },
      replace: true,
    });
  };

  const adminName = user?.name || "Admin Rani";
  const initials = adminName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <aside className="sidebar">
        <Link to="/admin/dashboard" className="brand" title="Ke Dashboard Utama">
          <span className="mark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 15h18M5 15c0-4 2-7 5-7h4c3 0 4.5 2 6 4.5l2 2.5M5 15a2.2 2.2 0 104.4 0 2.2 2.2 0 00-4.4 0zm9.6 0a2.2 2.2 0 104.4 0 2.2 2.2 0 00-4.4 0z"
                stroke="#C6A24C"
                strokeWidth="1.8"
              />
            </svg>
          </span>
          <span className="word">
            <span>Selaras</span>
            <small>Admin Panel</small>
          </span>
        </Link>

        <div className="nav-group-label">Menu Utama</div>

        <Link
          to="/admin/dashboard"
          className={`side-link ${isActive("/admin/dashboard") ? "active" : ""}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect
              x="3.5"
              y="3.5"
              width="7.5"
              height="7.5"
              rx="1.5"
              stroke={isActive("/admin/dashboard") ? "#C6A24C" : "#8D8F98"}
              strokeWidth="1.6"
            />
            <rect
              x="13"
              y="3.5"
              width="7.5"
              height="7.5"
              rx="1.5"
              stroke="#8D8F98"
              strokeWidth="1.6"
            />
            <rect
              x="3.5"
              y="13"
              width="7.5"
              height="7.5"
              rx="1.5"
              stroke="#8D8F98"
              strokeWidth="1.6"
            />
            <rect
              x="13"
              y="13"
              width="7.5"
              height="7.5"
              rx="1.5"
              stroke="#8D8F98"
              strokeWidth="1.6"
            />
          </svg>
          <span className="lbl">Dashboard</span>
        </Link>

        <Link
          to="/admin/mobil"
          className={`side-link ${isActive("/admin/mobil") ? "active" : ""}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 16h18M6 16c0-6 3-10 6-10s6 4 6 10M6 16a2.5 2.5 0 105 0 2.5 2.5 0 00-5 0zm8 0a2.5 2.5 0 105 0 2.5 2.5 0 00-5 0z"
              stroke={isActive("/admin/mobil") ? "#C6A24C" : "#8D8F98"}
              strokeWidth="1.6"
            />
          </svg>
          <span className="lbl">Armada Mobil</span>
        </Link>

        <Link
          to="/admin/transaksi"
          className={`side-link ${isActive("/admin/transaksi") ? "active" : ""}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6h16M4 12h16M4 18h10"
              stroke={isActive("/admin/transaksi") ? "#C6A24C" : "#8D8F98"}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <span className="lbl">Transaksi</span>
        </Link>

        <Link
          to="/admin/laporan"
          className={`side-link ${isActive("/admin/laporan") ? "active" : ""}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 17V9m5 8V5m5 12v-6m5 6V8"
              stroke={isActive("/admin/laporan") ? "#C6A24C" : "#8D8F98"}
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
          <span className="lbl">Laporan</span>
        </Link>

        <div className="nav-group-label">Lainnya</div>

        <Link
          to="/admin/pengaturan"
          className={`side-link ${isActive("/admin/pengaturan") ? "active" : ""}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M11 3.5h2l.6 2.6 2.3 1 2.5-1.2 1.4 1.4-1.2 2.5 1 2.3 2.6.6v2l-2.6.6-1 2.3 1.2 2.5-1.4 1.4-2.5-1.2-2.3 1-.6 2.6h-2l-.6-2.6-2.3-1-2.5 1.2-1.4-1.4 1.2-2.5-1-2.3-2.6-.6v-2l2.6-.6 1-2.3-1.2-2.5 1.4-1.4 2.5 1.2 2.3-1z"
              stroke={isActive("/admin/pengaturan") ? "#C6A24C" : "#8D8F98"}
              strokeWidth="1.4"
            />
            <circle
              cx="12"
              cy="12"
              r="2.6"
              stroke={isActive("/admin/pengaturan") ? "#C6A24C" : "#8D8F98"}
              strokeWidth="1.4"
            />
          </svg>
          <span className="lbl">Pengaturan</span>
        </Link>

        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="side-link"
          title="Buka Website Pengunjung di Tab Baru"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
              stroke="#8D8F98"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="lbl">Website Publik ↗</span>
        </Link>

        <div className="side-user">
          <span className="nav-avatar">{initials}</span>
          <div className="who">
            <b>{adminName}</b>
            <span>Super Admin</span>
          </div>
          <button
            type="button"
            className="side-logout-btn"
            onClick={() => setShowLogoutModal(true)}
            title="Keluar dari akun Admin"
            aria-label="Logout"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Modal Konfirmasi Logout dari Sidebar */}
      {showLogoutModal && (
        <div className="admin-modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div
            className="admin-modal-card admin-logout-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-icon-danger">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                  stroke="#C97575"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <polyline
                  points="16 17 21 12 16 7"
                  stroke="#C97575"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="21"
                  y1="12"
                  x2="9"
                  y2="12"
                  stroke="#C97575"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3 className="serif">Konfirmasi Keluar</h3>
            <p>
              Apakah Anda yakin ingin mengakhiri sesi admin? Anda harus login kembali untuk mengakses panel administrasi.
            </p>
            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-btn admin-btn-ghost"
                onClick={() => setShowLogoutModal(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={handleConfirmLogout}
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
