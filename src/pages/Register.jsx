// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI, getErrorMessage } from "../services/api";
import "./Login.css";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telepon: "",
    password: "",
    konfirmasi: "",
    setuju: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Kalkulasi persentase kelengkapan form
  const calcProgress = () => {
    let count = 0;
    if (formData.nama.trim().length > 2) count++;
    if (formData.email.includes("@") && formData.email.includes(".")) count++;
    if (formData.telepon.trim().length >= 9) count++;
    if (formData.password.length >= 6) count++;
    if (formData.konfirmasi && formData.konfirmasi === formData.password)
      count++;
    if (formData.setuju) count++;
    return Math.round((count / 6) * 100);
  };

  // Evaluasi kekuatan password
  const getPasswordStrength = () => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, label: "", class: "" };
    if (pwd.length < 6)
      return { score: 1, label: "Kurang Kuat", class: "active-weak" };
    const hasNum = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    if (pwd.length >= 8 && hasNum && hasSpecial) {
      return { score: 3, label: "Sangat Kuat", class: "active-strong" };
    }
    if (pwd.length >= 6 && (hasNum || hasSpecial)) {
      return { score: 2, label: "Cukup Baik", class: "active-medium" };
    }
    return { score: 1, label: "Standar", class: "active-weak" };
  };

  const strength = getPasswordStrength();
  const progress = calcProgress();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.konfirmasi) {
      showNotification("⚠️ Konfirmasi kata sandi tidak cocok!");
      return;
    }
    if (!formData.setuju) {
      showNotification("⚠️ Silakan centang persetujuan syarat & ketentuan");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nama_lengkap: formData.nama.trim(),
        email: formData.email.trim(),
        no_hp: formData.telepon.trim(),
        password: formData.password,
        role: formData.email.toLowerCase().includes("admin") ? "admin" : "customer",
      };

      await authAPI.register(payload);
      setLoading(false);
      showNotification("🎉 Akun berhasil didaftarkan! Mengarahkan ke halaman masuk...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setLoading(false);
      const errMsg = getErrorMessage(err);
      showNotification(`⚠️ ${errMsg}`);
    }
  };

  return (
    <div className="lmj-reg-wrapper">
      {/* Background ambient light */}
      <div className="lmj-auth-glow-1" />

      <div className="lmj-reg-container">
        <div className="lmj-reg-form-wrap">
          <div className="lmj-reg-form-head">
            <h1 className="lmj-reg-title">Buat Akun Baru</h1>
            <p className="lmj-reg-subtitle">Satu akun untuk seluruh armada.</p>
          </div>

          {/* Progress bar */}
          <div className="lmj-reg-progress-wrap">
            <div className="lmj-progress-label">
              <span>Kelengkapan formulir</span>
              <span>
                <strong>{progress}%</strong> Selesai
              </span>
            </div>
            <div className="lmj-progress-track">
              <div
                className="lmj-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <form className="lmj-reg-form" onSubmit={handleSubmit}>
            <div className="lmj-field">
              <label className="lmj-field-label">Nama Lengkap Sesuai KTP</label>
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
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  type="text"
                  name="nama"
                  required
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Contoh: Raden Adityawarman"
                  className="lmj-input"
                />
              </div>
            </div>

            <div className="lmj-reg-grid">
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
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="nama@email.com"
                    className="lmj-input"
                  />
                </div>
              </div>

              <div className="lmj-field">
                <label className="lmj-field-label">Nomor WhatsApp / HP</label>
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
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  <input
                    type="tel"
                    name="telepon"
                    required
                    value={formData.telepon}
                    onChange={handleChange}
                    placeholder="0812-2508-7482"
                    className="lmj-input"
                  />
                </div>
              </div>
            </div>

            <div className="lmj-reg-grid">
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
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 karakter"
                    className="lmj-input"
                  />
                  <button
                    type="button"
                    className="lmj-toggle-eye"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️‍🗨️" : "👁️"}
                  </button>
                </div>

                {formData.password && (
                  <div className="lmj-pwd-meter">
                    <div className="lmj-pwd-bars">
                      <div
                        className={`lmj-pwd-segment ${strength.score >= 1 ? strength.class : ""}`}
                      />
                      <div
                        className={`lmj-pwd-segment ${strength.score >= 2 ? strength.class : ""}`}
                      />
                      <div
                        className={`lmj-pwd-segment ${strength.score >= 3 ? strength.class : ""}`}
                      />
                    </div>
                    <div className="lmj-pwd-text">
                      <span>Keamanan sandi:</span>
                      <strong>{strength.label}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="lmj-field">
                <label className="lmj-field-label">Ulangi Kata Sandi</label>
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
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </span>
                  <input
                    type={showKonfirmasi ? "text" : "password"}
                    name="konfirmasi"
                    required
                    value={formData.konfirmasi}
                    onChange={handleChange}
                    placeholder="Ketik ulang sandi"
                    className="lmj-input"
                  />
                  <button
                    type="button"
                    className="lmj-toggle-eye"
                    onClick={() => setShowKonfirmasi(!showKonfirmasi)}
                  >
                    {showKonfirmasi ? "👁️‍🗨️" : "👁️"}
                  </button>
                </div>
                {formData.konfirmasi && (
                  <span
                    style={{
                      fontSize: "11px",
                      marginTop: "4px",
                      color:
                        formData.password === formData.konfirmasi
                          ? "#2eb85c"
                          : "#e55353",
                    }}
                  >
                    {formData.password === formData.konfirmasi
                      ? "✓ Kata sandi cocok"
                      : "✕ Sandi belum sesuai"}
                  </span>
                )}
              </div>
            </div>

            <label className="lmj-terms-check">
              <input
                type="checkbox"
                name="setuju"
                checked={formData.setuju}
                onChange={handleChange}
                className="lmj-checkbox"
                required
              />
              <span>
                Saya menyetujui <a href="#terms">Syarat & Ketentuan</a> sewa
                serta Kebijakan Privasi Selaras LMJ.
              </span>
            </label>

            <button
              type="submit"
              className="lmj-submit-btn"
              disabled={loading}
              style={{ marginTop: "12px" }}
            >
              {loading ? (
                <>
                  <div className="lmj-spinner" />
                  <span>Mendaftarkan Akun Anda...</span>
                </>
              ) : (
                <>
                  <span>Buat Akun Member Sekarang</span>
                  <span>✦</span>
                </>
              )}
            </button>
          </form>

          <div className="lmj-auth-switch" style={{ marginTop: "20px" }}>
            Sudah memiliki akun? <Link to="/login">Masuk ke sini</Link>
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
