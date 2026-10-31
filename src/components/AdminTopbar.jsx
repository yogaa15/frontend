// src/components/AdminTopbar.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminTopbar({ title = "Admin Panel" }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Transaksi Baru #TR-2291",
      desc: "Raka Pradana telah menyelesaikan pembayaran sewa Toyota Kijang Innova Reborn.",
      time: "10 menit lalu",
      read: false,
    },
    {
      id: 2,
      title: "Jadwal Servis Armada",
      desc: "Toyota Fortuner GR Sport (AA 9021 FTR) dijadwalkan servis berkala di Nasmoco Magelang.",
      time: "1 jam lalu",
      read: false,
    },
    {
      id: 3,
      title: "Pengembalian Mobil",
      desc: "Toyota Alphard Transformer (AA 2291 ALP) telah dikembalikan oleh pelanggan di Pool Mertoyudan.",
      time: "3 jam lalu",
      read: false,
    },
  ]);

  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

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
      <header className="admin-topbar">
        {/* Sisi Kiri: Status & Breadcrumb (Fitur search telah dihapus sesuai instruksi) */}
        <div className="admin-topbar-left">
          <div className="admin-topbar-page-info">
            <span className="admin-topbar-tag">
              <span className="live-dot" /> SISTEM ONLINE
            </span>
            <span className="admin-topbar-breadcrumb">
              Selaras Admin <span className="sep">/</span> <b className="curr">{title}</b>
            </span>
          </div>
        </div>

        {/* Sisi Kanan: Notifikasi, Profil, dan Tombol Logout */}
        <div className="topbar-right">
          {/* Tombol Notifikasi Interaktif */}
          <div className="notif-container" ref={notifRef}>
            <button
              type="button"
              className={`bell-wrap-btn ${showNotif ? "active" : ""}`}
              onClick={() => setShowNotif(!showNotif)}
              title="Notifikasi Sistem"
              aria-label="Buka notifikasi"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 9a6 6 0 1112 0c0 5 1.6 6.5 1.6 6.5H4.4S6 14 6 9z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="M10 19a2 2 0 004 0"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
              </svg>
              {unreadCount > 0 && <span className="bell-dot-badge">{unreadCount}</span>}
            </button>

            {/* Dropdown Notifikasi */}
            {showNotif && (
              <div className="notif-dropdown">
                <div className="notif-header">
                  <div className="notif-title">
                    <h4>Pemberitahuan</h4>
                    {unreadCount > 0 && (
                      <span className="notif-badge-pill">{unreadCount} baru</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="notif-action-btn"
                      onClick={handleMarkAllRead}
                    >
                      Tandai dibaca
                    </button>
                  )}
                </div>

                <div className="notif-list">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`notif-item ${item.read ? "read" : "unread"}`}
                    >
                      <div className="notif-icon">✦</div>
                      <div className="notif-body">
                        <div className="notif-item-title">{item.title}</div>
                        <p className="notif-item-desc">{item.desc}</p>
                        <span className="notif-item-time">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profil Admin */}
          <div className="admin-profile-pill" title={`Masuk sebagai ${adminName}`}>
            <span className="nav-avatar">{initials}</span>
            <div className="admin-profile-text">
              <span className="admin-profile-name">{adminName}</span>
              <span className="admin-profile-role">Super Admin</span>
            </div>
          </div>

          {/* Tombol Logout Fungsional */}
          <button
            type="button"
            className="admin-logout-btn"
            onClick={() => setShowLogoutModal(true)}
            title="Keluar dari sesi Admin"
            id="admin-logout-button"
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
            <span>Keluar</span>
          </button>
        </div>
      </header>

      {/* Modal Konfirmasi Logout */}
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
                id="confirm-logout-btn"
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
