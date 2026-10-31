// src/pages/admin/PengaturanAdmin.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import AdminTopbar from "../../components/AdminTopbar";
import { useAuth } from "../../context/AuthContext";
import { authAPI, settingsAPI, getErrorMessage } from "../../services/api";

const SETTINGS_STORAGE_KEY = "selaras_business_settings";

export default function PengaturanAdmin() {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();

  const [adminName, setAdminName] = useState(user?.name || user?.nama_lengkap || "Administrator Selaras");
  const [adminEmail, setAdminEmail] = useState(user?.email || "admin@selaras.id");
  const [adminPhone, setAdminPhone] = useState(user?.no_hp || "0812-3344-5566");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [businessName, setBusinessName] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved).businessName || "Selaras Rental Mobil Magelang";
    } catch {}
    return "Selaras Rental Mobil Magelang";
  });
  const [businessContact, setBusinessContact] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved).businessContact || "(0293) 321-8899";
    } catch {}
    return "(0293) 321-8899";
  });
  const [businessAddress, setBusinessAddress] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved).businessAddress || "Jl. Magelang - Yogyakarta KM 7, Mertoyudan, Magelang";
    } catch {}
    return "Jl. Magelang - Yogyakarta KM 7, Mertoyudan, Magelang";
  });
  const [businessHours, setBusinessHours] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved).businessHours || "24 Jam / 7 Hari";
    } catch {}
    return "24 Jam / 7 Hari";
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Ambil pengaturan bisnis terkini dari backend API
  useEffect(() => {
    let isMounted = true;
    async function fetchCurrentSettings() {
      try {
        const res = await settingsAPI.getSettings();
        if (isMounted && res?.data) {
          const s = res.data;
          if (s.businessName) setBusinessName(s.businessName);
          if (s.businessContact) setBusinessContact(s.businessContact);
          if (s.businessAddress) setBusinessAddress(s.businessAddress);
          if (s.businessHours) setBusinessHours(s.businessHours);
          if (s.adminPhone) setAdminPhone(s.adminPhone);
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(s));
        }
      } catch (err) {
        console.warn("Menggunakan pengaturan lokal:", err.message);
      }
    }
    fetchCurrentSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update identitas dari session user jika berubah
  useEffect(() => {
    if (user) {
      if (user.nama_lengkap || user.name) setAdminName(user.nama_lengkap || user.name);
      if (user.email) setAdminEmail(user.email);
      if (user.no_hp) setAdminPhone(user.no_hp);
    }
  }, [user]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!adminName.trim() || !adminEmail.trim()) {
      showToast("⚠️ Nama lengkap dan email admin wajib diisi.");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      showToast("⚠️ Kata sandi baru minimal 6 karakter.");
      return;
    }

    if (newPassword && !currentPassword) {
      showToast("⚠️ Masukkan kata sandi saat ini untuk verifikasi penggantian password.");
      return;
    }

    setSaving(true);

    try {
      // 1. Simpan perubahan profil & password ke Backend Auth
      const profilePayload = {
        nama_lengkap: adminName.trim(),
        email: adminEmail.trim(),
        no_hp: adminPhone.trim(),
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      };

      const authRes = await authAPI.updateProfile(profilePayload);
      const updatedUser = authRes?.data || {
        ...user,
        name: adminName.trim(),
        nama_lengkap: adminName.trim(),
        email: adminEmail.trim(),
        no_hp: adminPhone.trim(),
        role: "admin",
      };

      // 2. Simpan pengaturan bisnis ke Backend Settings
      const businessPayload = {
        businessName: businessName.trim(),
        businessContact: businessContact.trim(),
        businessAddress: businessAddress.trim(),
        businessHours: businessHours.trim(),
        adminPhone: adminPhone.trim(),
      };

      await settingsAPI.updateSettings(businessPayload);

      // Simpan juga ke cache lokal
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(businessPayload));

      // Update state auth context
      login(updatedUser);

      setSaving(false);
      setCurrentPassword("");
      setNewPassword("");
      showToast("✓ Pengaturan profil & informasi bisnis berhasil disimpan ke database!");
    } catch (err) {
      setSaving(false);
      const errMsg = getErrorMessage(err);
      showToast(`⚠️ ${errMsg}`);
    }
  };

  const handleReset = () => {
    setAdminName("Administrator Selaras");
    setAdminEmail("admin@selaras.id");
    setAdminPhone("0812-3344-5566");
    setBusinessName("Selaras Rental Mobil Magelang");
    setBusinessContact("(0293) 321-8899");
    setBusinessAddress("Jl. Magelang - Yogyakarta KM 7, Mertoyudan, Magelang");
    setBusinessHours("24 Jam / 7 Hari");
    showToast("Form pengaturan telah dikembalikan ke nilai standar.");
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate("/login", {
      state: { message: "Anda telah berhasil keluar dari akun Admin." },
      replace: true,
    });
  };

  const initials = adminName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="admin-shell">
      <AdminSidebar />

      <div className="admin-main">
        {/* Topbar Reusable (Search dihapus, ada notifikasi & logout fungsional) */}
        <AdminTopbar
          title="Pengaturan"
          subtitle="Kelola profil admin, keamanan, dan identitas bisnis."
        />

        <main className="admin-content">
          <div className="admin-head">
            <div>
              <h1 className="serif">Pengaturan Akun & Bisnis</h1>
              <p>Kelola profil admin, preferensi operasional, dan info kontak rental.</p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="admin-btn admin-btn-ghost"
                onClick={handleReset}
              >
                Reset Default
              </button>
              <button
                type="submit"
                form="admin-settings-form"
                className="admin-btn admin-btn-primary"
                disabled={saving}
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>

          <form id="admin-settings-form" onSubmit={handleSaveProfile}>
            <div className="grid-2col" style={{ marginBottom: "20px" }}>
              {/* Panel Profil Admin */}
              <div className="panel">
                <div className="panel-head">
                  <h3>Profil Administrator</h3>
                  <span className="tag">● Sesi Aktif</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "20px",
                  }}
                >
                  <span
                    className="nav-avatar"
                    style={{ width: "56px", height: "56px", fontSize: "20px" }}
                  >
                    {initials}
                  </span>
                  <div>
                    <b style={{ display: "block", fontSize: "16px" }}>{adminName}</b>
                    <span style={{ color: "var(--gold)", fontSize: "12.5px", fontWeight: 500 }}>
                      Super Administrator
                    </span>
                  </div>
                </div>

                <div className="form-group-admin">
                  <label className="label-form">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="input-text"
                  />
                </div>

                <div className="form-group-admin">
                  <label className="label-form">Alamat Email</label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="input-text"
                  />
                </div>

                <div className="form-group-admin">
                  <label className="label-form">Nomor Telepon Operasional</label>
                  <input
                    type="text"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    className="input-text"
                  />
                </div>
              </div>

              {/* Panel Informasi Bisnis */}
              <div className="panel">
                <div className="panel-head">
                  <h3>Informasi Bisnis & Rental</h3>
                </div>

                <div className="form-group-admin">
                  <label className="label-form">Nama Usaha Rental</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="input-text"
                  />
                </div>

                <div className="form-group-admin">
                  <label className="label-form">Kontak Layanan Pelanggan</label>
                  <input
                    type="text"
                    required
                    value={businessContact}
                    onChange={(e) => setBusinessContact(e.target.value)}
                    className="input-text"
                  />
                </div>

                <div className="form-group-admin">
                  <label className="label-form">Alamat Kantor / Garasi Utama</label>
                  <input
                    type="text"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    className="input-text"
                  />
                </div>

                <div className="form-group-admin">
                  <label className="label-form">Jam Operasional Layanan</label>
                  <input
                    type="text"
                    value={businessHours}
                    onChange={(e) => setBusinessHours(e.target.value)}
                    className="input-text"
                  />
                </div>
              </div>
            </div>

            {/* Panel Keamanan & Sesi */}
            <div className="panel">
              <div className="panel-head">
                <h3>Keamanan Akun & Manajemen Sesi</h3>
              </div>
              <div className="grid-2col">
                <div>
                  <p style={{ color: "var(--muted)", fontSize: "13.5px", marginBottom: "16px" }}>
                    Ubah kata sandi akun administrator Anda untuk menjaga keamanan akses panel.
                  </p>
                  <div className="form-group-admin">
                    <label className="label-form">Kata Sandi Saat Ini</label>
                    <input
                      type="password"
                      placeholder="Masukkan kata sandi lama..."
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="input-text"
                    />
                  </div>
                  <div className="form-group-admin">
                    <label className="label-form">Kata Sandi Baru</label>
                    <input
                      type="password"
                      placeholder="Minimal 8 karakter..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-text"
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    padding: "20px",
                    background: "var(--surface2)",
                    borderRadius: "10px",
                    border: "1px solid var(--line)",
                  }}
                >
                  <b style={{ color: "var(--text)", marginBottom: "6px" }}>
                    Akhiri Sesi Admin
                  </b>
                  <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "16px" }}>
                    Keluar dari sistem secara aman dan bersihkan token autentikasi pada browser ini.
                  </p>
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    onClick={() => setShowLogoutModal(true)}
                  >
                    🚪 Keluar dari Akun Sekarang
                  </button>
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>

      {/* Modal Konfirmasi Logout */}
      {showLogoutModal && (
        <div className="admin-modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div
            className="admin-modal-card admin-logout-modal"
            onClick={(e) => e.stopPropagation()}
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

      {/* Floating Toast Notification */}
      {toast && (
        <div className="admin-toast">
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
