// src/pages/Pembayaran.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../services/bookingService";
import "./Pembayaran.css";
import "./Login.css"; // for shimmer button & toast styles

export default function Pembayaran() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Proteksi halaman: Wajib login untuk melakukan pemesanan & pembayaran
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: "/pembayaran",
          bookingData: location.state,
          message: "Silakan masuk ke akun Anda terlebih dahulu untuk menyelesaikan pembayaran armada.",
        },
        replace: true,
      });
    }
  }, [isAuthenticated, navigate, location.state]);

  // State data sewa (bisa dari Beranda.jsx atau default)
  const dataSewa = location.state || {
    mobil: {
      nama: "Toyota Avanza Veloz 1.5",
      harga: 350000,
      spek: "MPV Keluarga Terfavorit • Manual • 7 Kursi",
      plat: "AA 1204 GA",
      img: "/cars/avanza-veloz.jpg",
    },
    durasi: 3,
    totalSewa: 1050000,
  };

  const [metode, setMetode] = useState("transfer");
  const [selectedBank, setSelectedBank] = useState("BCA");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [trxId, setTrxId] = useState("TRX-MLG-84920193");
  const [toast, setToast] = useState(null);

  // Credit card form states
  const [cardData, setCardData] = useState({
    number: "4532 8920 1823 9012",
    name: (user?.nama_lengkap || user?.name || "PEMEGANG KARTU").toUpperCase(),
    expiry: "09/28",
    cvv: "888",
  });

  // Countdown timer: 23 jam 59 menit 45 detik
  const [timeLeft, setTimeLeft] = useState(24 * 3600 - 15);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // Virtual account numbers
  const vaNumbers = {
    BCA: "8801 9283 7102 9481",
    Mandiri: "8932 4001 8291 0293",
    BNI: "8271 0029 4819 2831",
    BRI: "8102 9182 3746 1928",
    Permata: "8472 9102 8374 9102",
  };

  const depositJaminan = 250000;
  const biayaLayanan = 25000;
  const totalBayar = dataSewa.totalSewa + depositJaminan + biayaLayanan;

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopyVA = () => {
    const va = vaNumbers[selectedBank] || "8801 9283 7102 9481";
    navigator.clipboard?.writeText(va.replace(/\s/g, ""));
    setCopied(true);
    showNotification("✓ Nomor Virtual Account disalin ke clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBayar = () => {
    setLoading(true);
    const newTrxId = "TRX-MLG-" + Math.floor(10000000 + Math.random() * 90000000);
    setTrxId(newTrxId);

    const methodLabel =
      metode === "transfer"
        ? `Virtual Account ${selectedBank}`
        : metode === "qris"
          ? "QRIS Instant"
          : "Kartu Kredit";

    setTimeout(() => {
      setLoading(false);
      createOrder({
        id: newTrxId,
        mobil: dataSewa.mobil,
        namaMobil: dataSewa.mobil?.nama || "Armada Selaras",
        plat: dataSewa.mobil?.plat || "AA 8817 ZA",
        tglAmbil: dataSewa.tglAmbil || new Date().toISOString(),
        tglKembali:
          dataSewa.tglKembali ||
          new Date(Date.now() + 86400000 * (dataSewa.durasi || 3)).toISOString(),
        durasi: dataSewa.durasi || 3,
        durasiHari: `${dataSewa.durasi || 3} Hari`,
        totalSewa: dataSewa.totalSewa,
        depositJaminan,
        biayaLayanan,
        totalBayar,
        total: totalBayar,
        metodePembayaran: methodLabel,
        status: "lunas",
        userId: user?.id || null,
        userName: user?.nama_lengkap || user?.name || "Pelanggan Selaras",
        pelanggan: user?.nama_lengkap || user?.name || "Pelanggan Selaras",
        userEmail: (user?.email || "").toLowerCase().trim(),
        telepon: user?.no_hp || user?.telepon || "",
      });
      setShowSuccessModal(true);
    }, 1200);
  };

  return (
    <div className="lmj-pay-page">
      {/* ── STEP TRACKER ── */}
      <div className="lmj-pay-stepper">
        <div className="lmj-step-node completed">
          <div className="lmj-step-circle">✓</div>
          <span>1. Pilih Armada</span>
        </div>
        <div className="lmj-step-line done" />
        <div className="lmj-step-node completed">
          <div className="lmj-step-circle">✓</div>
          <span>2. Verifikasi Data</span>
        </div>
        <div className="lmj-step-line done" />
        <div className="lmj-step-node active">
          <div className="lmj-step-circle">3</div>
          <span>3. Selesaikan Pembayaran</span>
        </div>
      </div>

      {/* ── COUNTDOWN BANNER ── */}
      <div className="lmj-pay-timer-banner">
        <div className="lmj-timer-left">
          <div className="lmj-pulse-dot" />
          <span className="lmj-timer-title">
            Batas Waktu Pembayaran (Reservasi Terkunci):
          </span>
        </div>
        <div className="lmj-timer-digits">{formatTimer(timeLeft)}</div>
      </div>

      {/* ── MAIN 2-COLUMN GRID ── */}
      <div className="lmj-pay-grid">
        {/* KOLOM KIRI: Metode Pembayaran */}
        <div className="lmj-pay-methods-card">
          <span className="eyebrow">METODE PEMBAYARAN TERENKRIPSI</span>
          <h2 className="h1-title" style={{ fontSize: "24px", marginBottom: "20px" }}>
            Pilih Kanal Transaksi
          </h2>

          <div className="lmj-method-tabs">
            <div
              className={`lmj-method-tab ${metode === "transfer" ? "active" : ""}`}
              onClick={() => setMetode("transfer")}
            >
              <div className="lmj-method-tab-icon">🏦</div>
              <div className="lmj-method-tab-label">Virtual Account</div>
              <div className="lmj-method-tab-desc">Verifikasi Otomatis</div>
            </div>

            <div
              className={`lmj-method-tab ${metode === "qris" ? "active" : ""}`}
              onClick={() => setMetode("qris")}
            >
              <div className="lmj-method-tab-icon">⚡</div>
              <div className="lmj-method-tab-label">QRIS Instant</div>
              <div className="lmj-method-tab-desc">GoPay / OVO / Dana</div>
            </div>

            <div
              className={`lmj-method-tab ${metode === "kartu" ? "active" : ""}`}
              onClick={() => setMetode("kartu")}
            >
              <div className="lmj-method-tab-icon">💳</div>
              <div className="lmj-method-tab-label">Kartu Kredit</div>
              <div className="lmj-method-tab-desc">Visa / Mastercard</div>
            </div>
          </div>

          {/* TAB 1: TRANSFER BANK */}
          {metode === "transfer" && (
            <div>
              <div className="lmj-bank-selector">
                {["BCA", "Mandiri", "BNI", "BRI", "Permata"].map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    className={`lmj-bank-chip ${selectedBank === bank ? "active" : ""}`}
                    onClick={() => setSelectedBank(bank)}
                  >
                    Bank {bank}
                  </button>
                ))}
              </div>

              <div className="lmj-va-box">
                <div className="lmj-va-label">
                  Nomor Virtual Account Bank {selectedBank}
                </div>
                <div className="lmj-va-number-row">
                  <div className="lmj-va-number">{vaNumbers[selectedBank]}</div>
                  <button
                    type="button"
                    className="lmj-copy-btn"
                    onClick={handleCopyVA}
                  >
                    {copied ? "✓ Tersalin!" : "📋 Salin Nomor"}
                  </button>
                </div>
              </div>

              {/* Instructions Accordion */}
              <div className="lmj-va-instructions">
                <div className="lmj-instruction-item">
                  <div className="lmj-instruction-header">
                    <span>📱 Petunjuk Pembayaran Mobile Banking ({selectedBank})</span>
                    <span>▾</span>
                  </div>
                  <div className="lmj-instruction-body">
                    <ol>
                      <li>Buka aplikasi Mobile Banking {selectedBank} Anda.</li>
                      <li>Pilih menu <strong>Transfer / Pembayaran</strong> &gt; <strong>Virtual Account</strong>.</li>
                      <li>Masukkan kode VA: <strong>{vaNumbers[selectedBank]}</strong>.</li>
                      <li>Periksa nama penerima: <strong>SELARAS RENT CAR</strong> dan nominal bayar.</li>
                      <li>Konfirmasi transaksi dan simpan bukti transfer.</li>
                    </ol>
                  </div>
                </div>

                <div className="lmj-instruction-item">
                  <div className="lmj-instruction-header">
                    <span>🏧 Petunjuk Pembayaran Lewat Mesin ATM</span>
                    <span>▾</span>
                  </div>
                  <div className="lmj-instruction-body">
                    <ol>
                      <li>Masukkan kartu ATM dan PIN Anda di mesin ATM {selectedBank}.</li>
                      <li>Pilih menu <strong>Transaksi Lainnya</strong> &gt; <strong>Pembayaran Virtual Account</strong>.</li>
                      <li>Ketikkan nomor VA <strong>{vaNumbers[selectedBank]}</strong> lalu tekan Benar.</li>
                      <li>Pastikan detail tagihan sesuai, lalu selesaikan pembayaran.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QRIS INSTANT */}
          {metode === "qris" && (
            <div className="lmj-qris-container">
              <div className="lmj-qris-card">
                {/* Animated scanner laser */}
                <div className="lmj-qris-laser" />
                {/* SVG QR Code Illustration */}
                <svg className="lmj-qris-img" viewBox="0 0 100 100">
                  <rect width="100" height="100" fill="#fff" />
                  <path
                    d="M10 10h24v24h-24z M14 14h16v16h-16z M18 18h8v8h-8z M66 10h24v24h-24z M70 14h16v16h-16z M74 18h8v8h-8z M10 66h24v24h-24z M14 70h16v16h-16z M18 74h8v8h-8z M42 10h6v6h-6z M52 10h6v12h-6z M42 22h6v6h-6z M42 34h12v6h-12z M10 42h6v18h-6z M22 42h12v6h-12z M28 54h6v6h-6z M66 42h18v6h-18z M74 54h16v6h-16z M42 46h16v12h-16z M42 66h6v18h-6z M54 66h12v6h-12z M74 74h16v16h-16z M54 82h12v8h-12z"
                    fill="#15171D"
                  />
                  {/* Gold center accent */}
                  <rect x="44" y="44" width="12" height="12" rx="3" fill="#C6A24C" />
                  <text x="50" y="52" fill="#1A1509" fontSize="6" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">✦</text>
                </svg>
              </div>

              <div className="lmj-qris-badges">
                <span className="lmj-qris-badge-item">GOPAY</span>
                <span className="lmj-qris-badge-item">OVO</span>
                <span className="lmj-qris-badge-item">DANA</span>
                <span className="lmj-qris-badge-item">SHOPEEPAY</span>
                <span className="lmj-qris-badge-item">BCA MOBILE</span>
                <span className="lmj-qris-badge-item">LIVIN</span>
              </div>

              <p className="subtitle" style={{ fontSize: "13px", maxWidth: "420px" }}>
                Pindai kode QRIS di atas dengan aplikasi dompet digital atau mobile banking pilihan Anda. Transaksi akan terverifikasi secara instan dalam 5 detik.
              </p>
            </div>
          )}

          {/* TAB 3: KARTU KREDIT 3D */}
          {metode === "kartu" && (
            <div>
              {/* 3D Gold Luxury Card Preview */}
              <div className="lmj-cc-preview">
                <div className="lmj-cc-top">
                  <div className="lmj-cc-chip" />
                  <div className="lmj-cc-brand">SELARAS GOLD</div>
                </div>

                <div className="lmj-cc-number">
                  {cardData.number || "•••• •••• •••• ••••"}
                </div>

                <div className="lmj-cc-bottom">
                  <div className="lmj-cc-holder">
                    <span className="lmj-cc-lbl">Cardholder</span>
                    <span className="lmj-cc-name">
                      {cardData.name || "NAMA PEMILIK"}
                    </span>
                  </div>
                  <div className="lmj-cc-holder" style={{ textAlign: "right" }}>
                    <span className="lmj-cc-lbl">Expires</span>
                    <span className="lmj-cc-name">{cardData.expiry || "MM/YY"}</span>
                  </div>
                </div>
              </div>

              {/* Card Inputs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="lmj-field">
                  <label className="lmj-field-label">Nomor Kartu</label>
                  <input
                    type="text"
                    maxLength="19"
                    value={cardData.number}
                    onChange={(e) =>
                      setCardData({ ...cardData, number: e.target.value })
                    }
                    className="lmj-input"
                    placeholder="4532 •••• •••• ••••"
                  />
                </div>

                <div className="lmj-field">
                  <label className="lmj-field-label">Nama pada Kartu</label>
                  <input
                    type="text"
                    value={cardData.name}
                    onChange={(e) =>
                      setCardData({ ...cardData, name: e.target.value })
                    }
                    className="lmj-input"
                    placeholder="Sesuai nama tertera"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="lmj-field">
                    <label className="lmj-field-label">Kadaluarsa (MM/YY)</label>
                    <input
                      type="text"
                      maxLength="5"
                      value={cardData.expiry}
                      onChange={(e) =>
                        setCardData({ ...cardData, expiry: e.target.value })
                      }
                      className="lmj-input"
                      placeholder="09/28"
                    />
                  </div>
                  <div className="lmj-field">
                    <label className="lmj-field-label">CVV / CVC</label>
                    <input
                      type="password"
                      maxLength="4"
                      value={cardData.cvv}
                      onChange={(e) =>
                        setCardData({ ...cardData, cvv: e.target.value })
                      }
                      className="lmj-input"
                      placeholder="•••"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* KOLOM KANAN: Rincian Pesanan & Pembayaran */}
        <div className="lmj-pay-summary-card">
          <div className="lmj-summary-header">
            <span className="eyebrow">RINGKASAN PESANAN</span>
            <h3 className="lmj-summary-title">Rincian Pembayaran</h3>
          </div>

          {/* Car thumbnail snippet */}
          <div className="lmj-summary-car-box">
            <img
              src={
                dataSewa.mobil.img ||
                "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=400"
              }
              alt={dataSewa.mobil.nama}
              className="lmj-summary-car-img"
            />
            <div>
              <h4 className="lmj-summary-car-name">{dataSewa.mobil.nama}</h4>
              <p className="lmj-summary-car-sub">
                Durasi: <strong>{dataSewa.durasi} Hari</strong>
              </p>
              <p className="lmj-summary-car-sub" style={{ color: "var(--gold)" }}>
                Rp {dataSewa.mobil.harga.toLocaleString("id-ID")} / hari
              </p>
            </div>
          </div>

          {/* Price Rows */}
          <div className="lmj-price-rows" style={{ marginTop: "18px" }}>
            <div className="lmj-price-row">
              <span>Sewa ({dataSewa.durasi} hari)</span>
              <span>Rp {dataSewa.totalSewa.toLocaleString("id-ID")}</span>
            </div>

            <div className="lmj-price-row">
              <span>Deposit Jaminan (Refundable)</span>
              <span>Rp {depositJaminan.toLocaleString("id-ID")}</span>
            </div>

            <div className="lmj-price-row">
              <span>Biaya Layanan & Asuransi</span>
              <span>Rp {biayaLayanan.toLocaleString("id-ID")}</span>
            </div>

            <div className="lmj-price-row total">
              <span>Total Tagihan</span>
              <span className="lmj-total-amount">
                Rp {totalBayar.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            className="lmj-submit-btn"
            disabled={loading}
            onClick={handleBayar}
          >
            {loading ? (
              <>
                <div className="lmj-spinner" />
                <span>Memproses Pembayaran...</span>
              </>
            ) : (
              <>
                <span>Konfirmasi & Bayar Sekarang</span>
                <span>✓</span>
              </>
            )}
          </button>

          {/* Trust guarantee */}
          <div className="lmj-pay-guarantee">
            <span>🛡️</span>
            <span>
              <strong>Garansi Deposit 100%:</strong> Dana deposit akan dikembalikan secara penuh ke rekening Anda setelah armada dikembalikan dalam kondisi prima.
            </span>
          </div>
        </div>
      </div>

      {/* ── SUCCESS MODAL POPUP ── */}
      {showSuccessModal && (
        <div className="lmj-modal-overlay">
          <div className="lmj-modal-card">
            <div className="lmj-modal-check">✓</div>
            <h2 className="lmj-modal-title">Pembayaran Berhasil!</h2>
            <p className="lmj-modal-desc">
              Pesanan armada Anda telah dikonfirmasi secara resmi oleh sistem Selaras LMJ. Tim operasional kami sedang menyiapkan unit Anda.
            </p>

            <div className="lmj-modal-details">
              <div className="lmj-modal-row">
                <span>ID Transaksi:</span>
                <strong>{trxId}</strong>
              </div>
              <div className="lmj-modal-row">
                <span>Armada:</span>
                <strong>{dataSewa.mobil.nama}</strong>
              </div>
              <div className="lmj-modal-row">
                <span>Total Bayar:</span>
                <strong style={{ color: "var(--gold)" }}>
                  Rp {totalBayar.toLocaleString("id-ID")}
                </strong>
              </div>
              <div className="lmj-modal-row">
                <span>Metode:</span>
                <strong>
                  {metode === "transfer"
                    ? `Virtual Account ${selectedBank}`
                    : metode === "qris"
                      ? "QRIS Instant"
                      : "Kartu Kredit"}
                </strong>
              </div>
            </div>

            <div className="lmj-modal-btns">
              <button
                type="button"
                className="lmj-submit-btn"
                style={{ background: "var(--gold)", color: "var(--btn-text)", fontWeight: 700 }}
                onClick={() => navigate("/riwayat")}
              >
                📋 Lihat Riwayat Pesanan Saya ➔
              </button>

              <button
                type="button"
                className="lmj-demo-btn"
                style={{ padding: "12px", width: "100%" }}
                onClick={() => {
                  showNotification("📄 Mengunduh Invoice PDF...");
                }}
              >
                Unduh Bukti Pembayaran (PDF)
              </button>

              <button
                type="button"
                className="lmj-demo-btn"
                style={{ padding: "10px", width: "100%", opacity: 0.8 }}
                onClick={() => navigate("/")}
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="lmj-toast">
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
