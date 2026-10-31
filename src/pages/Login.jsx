// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI, getErrorMessage } from "../services/api";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const redirectMessage = location.state?.message;

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showNotification("⚠️ Mohon isi email dan kata sandi Anda");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      setLoading(false);
      const userData = response.data;
      login(userData);
      showNotification("✨ Berhasil masuk! Mengarahkan...");

      const isAdmin = userData.role === "admin" || email.toLowerCase().includes("admin");

      setTimeout(() => {
        if (location.state?.from) {
          navigate(location.state.from, {
            state: location.state.bookingData,
            replace: true,
          });
        } else if (isAdmin) {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      }, 700);
    } catch (err) {
      setLoading(false);
      const errMsg = getErrorMessage(err);
      showNotification(`⚠️ ${errMsg}`);
    }
  };

  return (
    <div className="lmj-auth-wrapper">
      {/* Background ambient light */}
      <div className="lmj-auth-glow-1" />
      <div className="lmj-auth-glow-2" />

      {/* Main Glass Card */}
      <div className="lmj-auth-card">
        <div className="lmj-auth-header">
          <div className="lmj-auth-badge">
            <span>✦</span>
            <span>PORTAL PELANGGAN SELARAS</span>
          </div>
          <h1 className="lmj-auth-title">Masuk ke Akun Anda</h1>
          <p className="lmj-auth-subtitle">
            Akses armada mewah terbaik dan riwayat pemesanan Anda dengan mudah.
          </p>
        </div>

        {redirectMessage && (
          <div
            style={{
              background: "rgba(198, 162, 76, 0.15)",
              border: "1px solid var(--gold)",
              borderRadius: "10px",
              padding: "12px 14px",
              marginBottom: "18px",
              fontSize: "13px",
              color: "var(--text)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>🔒</span>
            <span>{redirectMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="lmj-form" onSubmit={handleSubmit}>
          <div className="lmj-field">
            <label className="lmj-field-label">Alamat Email</label>
            <div className="lmj-input-wrapper">
              <span className="lmj-input-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="lmj-input"
              />
            </div>
          </div>

          <div className="lmj-field">
            <label className="lmj-field-label">Kata Sandi</label>
            <div className="lmj-input-wrapper">
              <span className="lmj-input-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi..."
                className="lmj-input"
              />
              <button
                type="button"
                className="lmj-toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Sembunyikan" : "Tampilkan"}
              >
                {showPassword ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="lmj-auth-options">
            <label className="lmj-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="lmj-checkbox"
              />
              <span>Ingat saya</span>
            </label>
            <a
              href="#forgot"
              onClick={(e) => {
                e.preventDefault();
                showNotification(
                  "📩 Link pemulihan telah dikirim ke email terdaftar!",
                );
              }}
              className="lmj-forgot-link"
            >
              Lupa Kata Sandi?
            </a>
          </div>

          <button type="submit" className="lmj-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <div className="lmj-spinner" />
                <span>Memverifikasi Akun ke Server...</span>
              </>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <span>→</span>
              </>
            )}
          </button>

        </form>

        <div className="lmj-auth-divider">
          <span>atau masuk via</span>
        </div>

        <div className="lmj-social-group">
          <button
            type="button"
            className="lmj-social-btn"
            onClick={() =>
              showNotification("🚀 Menghubungkan Google Account...")
            }
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            className="lmj-social-btn"
            onClick={() => showNotification(" Menghubungkan Apple ID...")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.62-.75 1.04-1.8 0.93-2.84-.9.04-2 0.6-2.65 1.35-.58.66-1.09 1.73-.95 2.76.99.08 2.05-.52 2.67-1.27z" />
            </svg>
            <span>Apple</span>
          </button>
        </div>

        <div className="lmj-auth-switch">
          Belum memiliki akun? <Link to="/register">Daftar Akun Baru</Link>
        </div>

        {/* Security badges */}
        <div className="lmj-auth-trust">
          <div className="lmj-trust-item">
            <span>🔒</span>
            <span>256-Bit SSL Enkripsi</span>
          </div>
          <div className="lmj-trust-item">
            <span>🛡️</span>
            <span>Privasi Terlindungi</span>
          </div>
        </div>
      </div>

      {/* Floating notification */}
      {toast && (
        <div className="lmj-toast">
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
