// src/pages/RiwayatPesanan.jsx
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllOrders, fetchOrdersFromBackend, updateOrderStatus } from "../services/bookingService";
import "./RiwayatPesanan.css";

export default function RiwayatPesanan() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState(() => getAllOrders());
  const [activeTab, setActiveTab] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null); // Modal detail invoice
  const [cancelingOrder, setCancelingOrder] = useState(null); // Modal konfirmasi pembatalan
  const [toast, setToast] = useState(null);

  // Cek autentikasi: Jika belum login, redirect ke halaman login
  useEffect(() => {
    if (!user) {
      navigate("/login", {
        replace: true,
        state: {
          message:
            "Silakan masuk terlebih dahulu untuk melihat riwayat pesanan Anda.",
          from: "/riwayat",
        },
      });
    }
  }, [user, navigate]);

  // Sinkronisasi data pesanan dari backend API
  useEffect(() => {
    let isMounted = true;
    async function syncOrders() {
      const data = await fetchOrdersFromBackend();
      if (isMounted && Array.isArray(data)) {
        setOrders(data);
      }
    }
    syncOrders();

    const handleUpdate = () => {
      setOrders(getAllOrders());
    };
    window.addEventListener("orders_updated", handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("orders_updated", handleUpdate);
    };
  }, []);

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const copyToClipboard = (text, label) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showNotification(`✓ ${label} (${text}) disalin ke clipboard!`);
    }
  };

  // Filter transaksi khusus untuk akun yang sedang login
  const myOrders = useMemo(() => {
    if (!user) return [];
    const currentUserEmail = (user.email || "").toLowerCase().trim();
    const currentUserId = user.id ? String(user.id) : null;
    const isUserAdmin = user.role === "admin" || currentUserEmail.includes("admin");

    // Jika admin yang membuka halaman ini, tampilkan seluruh riwayat
    if (isUserAdmin) return orders;

    // Untuk pelanggan biasa: hanya tampilkan pesanan milik akunnya sendiri
    return orders.filter((order) => {
      const orderEmail = (order.userEmail || order.email || "").toLowerCase().trim();
      const orderUserId = order.userId || order.user_id ? String(order.userId || order.user_id) : null;

      if (currentUserEmail && orderEmail && currentUserEmail === orderEmail) {
        return true;
      }
      if (currentUserId && orderUserId && currentUserId === orderUserId) {
        return true;
      }
      return false;
    });
  }, [orders, user]);

  // Filter orders based on Tab and Search
  const filteredOrders = useMemo(() => {
    return myOrders.filter((order) => {
      const st = (order.status || "").toLowerCase();
      // 1. Tab Status
      if (activeTab === "Aktif") {
        if (
          st !== "dikonfirmasi" &&
          st !== "sedang berjalan" &&
          st !== "lunas" &&
          st !== "pending"
        ) {
          return false;
        }
      } else if (activeTab === "Sedang Berjalan") {
        if (st !== "sedang berjalan") return false;
      } else if (activeTab === "Selesai") {
        if (st !== "selesai") return false;
      } else if (activeTab === "Dibatalkan") {
        if (st !== "dibatalkan") return false;
      }

      // 2. Search query (ID, Nama Mobil, Metode Bayar)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = order.id?.toLowerCase().includes(q);
        const matchNama = order.mobil?.nama?.toLowerCase().includes(q);
        const matchKategori = order.mobil?.kategori?.toLowerCase().includes(q);
        const matchMetode = order.metodePembayaran?.toLowerCase().includes(q);
        if (!matchId && !matchNama && !matchKategori && !matchMetode) {
          return false;
        }
      }

      return true;
    });
  }, [myOrders, activeTab, searchQuery]);

  // Status Counts
  const counts = useMemo(() => {
    return {
      semua: myOrders.length,
      aktif: myOrders.filter(
        (o) => {
          const st = (o.status || "").toLowerCase();
          return st === "dikonfirmasi" || st === "sedang berjalan" || st === "lunas" || st === "pending";
        }
      ).length,
      berjalan: myOrders.filter((o) => (o.status || "").toLowerCase() === "sedang berjalan").length,
      selesai: myOrders.filter((o) => (o.status || "").toLowerCase() === "selesai").length,
      batal: myOrders.filter((o) => (o.status || "").toLowerCase() === "dibatalkan").length,
    };
  }, [myOrders]);

  // Total pengeluaran sewa selesai & aktif
  const totalPengeluaran = useMemo(() => {
    return myOrders
      .filter((o) => (o.status || "").toLowerCase() !== "dibatalkan")
      .reduce((acc, curr) => acc + (curr.totalBayar || curr.total || 0), 0);
  }, [myOrders]);

  // Handle pembatalan pesanan
  const handleConfirmBatal = () => {
    if (!cancelingOrder) return;
    const updated = updateOrderStatus(cancelingOrder.id, "Dibatalkan");
    setOrders(updated);
    setCancelingOrder(null);
    if (selectedOrder && selectedOrder.id === cancelingOrder.id) {
      setSelectedOrder({ ...selectedOrder, status: "Dibatalkan" });
    }
    showNotification(
      "ℹ️ Reservasi berhasil dibatalkan. Pengembalian dana akan diproses.",
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Sedang Berjalan":
        return (
          <span className="rw-badge rw-badge--active">
            <span className="rw-dot rw-dot--pulse-blue" /> Sedang Berjalan
          </span>
        );
      case "Dikonfirmasi":
        return (
          <span className="rw-badge rw-badge--confirmed">
            <span className="rw-dot rw-dot--pulse-green" /> Dikonfirmasi
          </span>
        );
      case "Selesai":
        return (
          <span className="rw-badge rw-badge--done">
            <span className="rw-dot rw-dot--gray" /> Selesai
          </span>
        );
      case "Dibatalkan":
        return (
          <span className="rw-badge rw-badge--canceled">
            <span className="rw-dot rw-dot--red" /> Dibatalkan
          </span>
        );
      default:
        return <span className="rw-badge">{status}</span>;
    }
  };

  const formatTanggalIndo = (isoString) => {
    if (!isoString) return "-";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  // Jika belum ada objek user (sedang proses redirect), render kosong / loading aman
  if (!user) {
    return null;
  }

  return (
    <div className="rw-page">
      {/* ── BREADCRUMB ── */}
      <div className="rw-breadcrumb-bar">
        <div className="rw-container">
          <nav className="rw-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Beranda</Link>
            <span className="rw-breadcrumb-sep">/</span>
            <span className="rw-breadcrumb-current">Riwayat Pesanan</span>
          </nav>
        </div>
      </div>

      <div className="rw-container">
        {/* ── PAGE HEADER ── */}
        <header className="rw-header">
          <div className="rw-header-info">
            <span className="rw-eyebrow">
              ✦ SELARAS RENTAL CAR • PORTAL PELANGGAN
            </span>
            <h1 className="rw-title">Riwayat Reservasi &amp; Sewa Mobil</h1>
            <p className="rw-subtitle">
              Pantau jadwal serah terima armada, unduh e-tiket resmi, serta cek
              status transaksi sewa Anda secara real-time.
            </p>
          </div>

          <div className="rw-header-action">
            <Link to="/sewa" className="lmj-btn lmj-btn--gold">
              <span>+ Pesan Armada Baru</span>
            </Link>
          </div>
        </header>

        {/* ── METRIC STATS SUMMARY CARDS ── */}
        <section className="rw-stats-grid">
          <div className="rw-stat-card">
            <div className="rw-stat-icon">📑</div>
            <div className="rw-stat-data">
              <span className="rw-stat-num">{counts.semua}</span>
              <span className="rw-stat-label">Total Reservasi</span>
            </div>
            <span className="rw-stat-hint">Riwayat pemesanan Anda</span>
          </div>

          <div className="rw-stat-card rw-stat-card--highlight">
            <div className="rw-stat-icon">🚗</div>
            <div className="rw-stat-data">
              <span className="rw-stat-num" style={{ color: "var(--gold)" }}>
                {counts.aktif}
              </span>
              <span className="rw-stat-label">Armada Aktif / Dikonfirmasi</span>
            </div>
            <span className="rw-stat-hint">
              Siap pakai &amp; sedang beroperasi
            </span>
          </div>

          <div className="rw-stat-card">
            <div className="rw-stat-icon">✓</div>
            <div className="rw-stat-data">
              <span className="rw-stat-num">{counts.selesai}</span>
              <span className="rw-stat-label">Sewa Selesai</span>
            </div>
            <span className="rw-stat-hint">Telah dikembalikan tuntas</span>
          </div>

          <div className="rw-stat-card">
            <div className="rw-stat-icon">💳</div>
            <div className="rw-stat-data">
              <span className="rw-stat-num" style={{ fontSize: "20px" }}>
                Rp {totalPengeluaran.toLocaleString("id-ID")}
              </span>
              <span className="rw-stat-label">Total Transaksi</span>
            </div>
            <span className="rw-stat-hint">
              Termasuk deposit &amp; proteksi
            </span>
          </div>
        </section>

        {/* ── TOOLBAR: TABS & SEARCH ── */}
        <div className="rw-toolbar">
          <div className="rw-tabs">
            <button
              type="button"
              className={`rw-tab-btn ${activeTab === "Semua" ? "active" : ""}`}
              onClick={() => setActiveTab("Semua")}
            >
              Semua Pesanan
              <span className="rw-tab-badge">{counts.semua}</span>
            </button>
            <button
              type="button"
              className={`rw-tab-btn ${activeTab === "Aktif" ? "active" : ""}`}
              onClick={() => setActiveTab("Aktif")}
            >
              Aktif / Dikonfirmasi
              <span className="rw-tab-badge rw-tab-badge--gold">
                {counts.aktif}
              </span>
            </button>
            <button
              type="button"
              className={`rw-tab-btn ${activeTab === "Sedang Berjalan" ? "active" : ""}`}
              onClick={() => setActiveTab("Sedang Berjalan")}
            >
              Sedang Berjalan
              <span className="rw-tab-badge">{counts.berjalan}</span>
            </button>
            <button
              type="button"
              className={`rw-tab-btn ${activeTab === "Selesai" ? "active" : ""}`}
              onClick={() => setActiveTab("Selesai")}
            >
              Selesai
              <span className="rw-tab-badge">{counts.selesai}</span>
            </button>
            {counts.batal > 0 && (
              <button
                type="button"
                className={`rw-tab-btn ${activeTab === "Dibatalkan" ? "active" : ""}`}
                onClick={() => setActiveTab("Dibatalkan")}
              >
                Dibatalkan
                <span className="rw-tab-badge">{counts.batal}</span>
              </button>
            )}
          </div>

          <div className="rw-search-wrapper">
            <span className="rw-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Cari ID transaksi, nama armada..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rw-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="rw-search-clear"
                onClick={() => setSearchQuery("")}
                title="Hapus pencarian"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── ORDERS LIST ── */}
        {filteredOrders.length > 0 ? (
          <div className="rw-orders-list">
            {filteredOrders.map((order) => (
              <article key={order.id} className="rw-card">
                {/* Card Top Header */}
                <div className="rw-card__header">
                  <div className="rw-card__header-left">
                    <span className="rw-card__label-id">ID Transaksi:</span>
                    <button
                      type="button"
                      className="rw-card__copy-btn"
                      onClick={() => copyToClipboard(order.id, "ID Transaksi")}
                      title="Salin ID Transaksi"
                    >
                      <strong className="rw-card__id">{order.id}</strong>
                      <span className="rw-copy-icon">📋</span>
                    </button>
                    <span className="rw-card__date-dot">•</span>
                    <span className="rw-card__created-at">
                      Dibuat {formatTanggalIndo(order.createdAt)}
                    </span>
                  </div>

                  <div className="rw-card__header-right">
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Card Main Body */}
                <div className="rw-card__body">
                  {/* Car Thumbnail */}
                  <div className="rw-card__car-thumb">
                    <img
                      src={
                        order.mobil?.img ||
                        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=400"
                      }
                      alt={order.mobil?.nama || "Mobil"}
                      className="rw-car-img"
                      loading="lazy"
                    />
                    <span className="rw-cat-chip">
                      {order.mobil?.kategori || "Armada"}
                    </span>
                  </div>

                  {/* Car Information & Rental Details */}
                  <div className="rw-card__details">
                    <div className="rw-card__title-row">
                      <h3 className="rw-car-title">{order.mobil?.nama}</h3>
                      {order.mobil?.plat && (
                        <span className="rw-plat-badge">
                          {order.mobil.plat}
                        </span>
                      )}
                    </div>

                    <div className="rw-card__tags">
                      <span className="rw-tag">
                        ⚙️ {order.mobil?.transmisi || "Matic"}
                      </span>
                      <span className="rw-tag">
                        👥 {order.mobil?.kursi || 4} Kursi
                      </span>
                      <span className="rw-tag">
                        ⛽ {order.mobil?.bbm || "Bensin"}
                      </span>
                      <span className="rw-tag rw-tag--gold">
                        🛡️ Proteksi Asuransi
                      </span>
                    </div>

                    {/* Schedule Grid */}
                    <div className="rw-schedule-box">
                      <div className="rw-schedule-item">
                        <span className="rw-sched-lbl">Pengambilan Unit</span>
                        <strong className="rw-sched-val">
                          📅 {formatTanggalIndo(order.tglAmbil)}
                        </strong>
                        <span className="rw-sched-loc">
                          📍 {order.lokasiAmbil || "Showroom Selaras"}
                        </span>
                      </div>

                      <div className="rw-schedule-arrow">➔</div>

                      <div className="rw-schedule-item">
                        <span className="rw-sched-lbl">Pengembalian Unit</span>
                        <strong className="rw-sched-val">
                          📅 {formatTanggalIndo(order.tglKembali)}
                        </strong>
                        <span className="rw-sched-loc">
                          📍 {order.lokasiKembali || "Showroom Selaras"}
                        </span>
                      </div>

                      <div className="rw-schedule-duration">
                        <span className="rw-dur-num">{order.durasi || 1}</span>
                        <span className="rw-dur-unit">Hari</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Summary & Actions */}
                  <div className="rw-card__price-col">
                    <span className="rw-price-col-lbl">Total Pembayaran:</span>
                    <div className="rw-price-val">
                      Rp {(order.totalBayar || 0).toLocaleString("id-ID")}
                    </div>
                    <span className="rw-method-chip">
                      💳 {order.metodePembayaran || "Virtual Account"}
                    </span>
                    <span className="rw-deposit-note">
                      Sudah termasuk Deposit Rp{" "}
                      {(order.depositJaminan || 500000).toLocaleString("id-ID")}{" "}
                      (Refundable)
                    </span>

                    <div className="rw-card__action-btns">
                      <button
                        type="button"
                        className="rw-btn-detail"
                        onClick={() => setSelectedOrder(order)}
                      >
                        📄 Lihat E-Tiket &amp; Detail
                      </button>

                      <div className="rw-btn-sub-row">
                        <Link
                          to={`/sewa/${order.mobil?.id || 1}`}
                          className="rw-btn-reorder"
                          title="Sewa armada ini kembali"
                        >
                          🔄 Sewa Lagi
                        </Link>

                        {order.status === "Dikonfirmasi" && (
                          <button
                            type="button"
                            className="rw-btn-cancel"
                            onClick={() => setCancelingOrder(order)}
                          >
                            Batalkan
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Info Notice */}
                <div className="rw-card__footer">
                  <span className="rw-footer-tip">
                    💡 <strong>Tips:</strong> Siapkan KTP &amp; SIM A asli saat
                    serah terima unit di lokasi. Driver / staff kami akan
                    menghubungi 1 jam sebelum jadwal.
                  </span>
                  <a
                    href={`https://wa.me/6281234567890?text=Halo%20Admin%20Selaras,%20saya%20ingin%20konfirmasi%20pesanan%20dengan%20ID%20${order.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rw-chat-cs-link"
                  >
                    💬 Hubungi Concierge Armada
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rw-empty">
            <div className="rw-empty-icon">🚗📭</div>
            <h3 className="rw-empty-title">
              {searchQuery
                ? "Tidak Ada Pesanan yang Cocok"
                : activeTab !== "Semua"
                  ? `Tidak ada pesanan berstatus "${activeTab}"`
                  : "Belum Ada Riwayat Pemesanan"}
            </h3>
            <p className="rw-empty-desc">
              {searchQuery
                ? `Pencarian untuk "${searchQuery}" tidak menemukan riwayat pesanan. Coba periksa kembali kata kunci Anda.`
                : "Anda belum memiliki riwayat reservasi mobil. Pilih armada mewah favorit Anda sekarang dengan tarif terbaik dan layanan kelas satu."}
            </p>
            <div className="rw-empty-actions">
              {searchQuery && (
                <button
                  type="button"
                  className="lmj-btn lmj-btn--outline"
                  onClick={() => setSearchQuery("")}
                >
                  Bersihkan Pencarian
                </button>
              )}
              <Link to="/sewa" className="lmj-btn lmj-btn--gold">
                Jelajahi Armada Sekarang ➔
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL DETAIL / E-TIKET PESANAN ── */}
      {selectedOrder && (
        <div
          className="lmj-modal-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="lmj-modal-card rw-modal-eticket"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "620px" }}
          >
            <div className="rw-eticket-badge">E-TIKET RESERVASI RESMI</div>
            <h2
              className="lmj-modal-title"
              style={{ fontSize: "22px", marginBottom: "4px" }}
            >
              Bukti Pemesanan Armada
            </h2>
            <p className="lmj-modal-desc" style={{ marginBottom: "16px" }}>
              Simpan bukti ini sebagai konfirmasi resmi saat pengambilan dan
              serah terima unit Selaras Rent Car.
            </p>

            <div className="rw-eticket-top">
              <div className="rw-eticket-code-box">
                <span className="rw-eticket-code-lbl">KODE BOOKING</span>
                <strong className="rw-eticket-code">{selectedOrder.id}</strong>
              </div>
              <div>{getStatusBadge(selectedOrder.status)}</div>
            </div>

            {/* Car Brief */}
            <div className="rw-eticket-car-box">
              <img
                src={selectedOrder.mobil?.img}
                alt={selectedOrder.mobil?.nama}
                className="rw-eticket-car-img"
              />
              <div className="rw-eticket-car-details">
                <h4 className="rw-eticket-car-name">
                  {selectedOrder.mobil?.nama}
                </h4>
                <div className="rw-eticket-car-spek">
                  {selectedOrder.mobil?.spek ||
                    `${selectedOrder.mobil?.kategori} ${selectedOrder.mobil?.transmisi}`}
                </div>
                <div className="rw-eticket-plat">
                  Plat Armada:{" "}
                  <strong>{selectedOrder.mobil?.plat || "B 1024 SLR"}</strong>
                </div>
              </div>
            </div>

            {/* Details Table */}
            <div className="lmj-modal-details">
              <div className="lmj-modal-row">
                <span>Nama Pelanggan:</span>
                <strong>
                  {selectedOrder.userName || user?.nama_lengkap || user?.name || "Pelanggan"}
                </strong>
              </div>
              <div className="lmj-modal-row">
                <span>Tanggal Sewa:</span>
                <strong>
                  {formatTanggalIndo(selectedOrder.tglAmbil)} s/d{" "}
                  {formatTanggalIndo(selectedOrder.tglKembali)}
                </strong>
              </div>
              <div className="lmj-modal-row">
                <span>Durasi:</span>
                <strong>{selectedOrder.durasi} Hari</strong>
              </div>
              <div className="lmj-modal-row">
                <span>Tipe Layanan:</span>
                <strong>
                  {selectedOrder.layanan || "Lepas Kunci (Self Drive)"}
                </strong>
              </div>
              <div className="lmj-modal-row">
                <span>Metode Pembayaran:</span>
                <strong>{selectedOrder.metodePembayaran}</strong>
              </div>
              <div className="lmj-modal-row">
                <span>Biaya Sewa Unit:</span>
                <span>
                  Rp {(selectedOrder.totalSewa || 0).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="lmj-modal-row">
                <span>Deposit Jaminan (Refundable):</span>
                <span>
                  Rp{" "}
                  {(selectedOrder.depositJaminan || 500000).toLocaleString(
                    "id-ID",
                  )}
                </span>
              </div>
              <div className="lmj-modal-row">
                <span>Biaya Layanan &amp; Asuransi:</span>
                <span>
                  Rp{" "}
                  {(selectedOrder.biayaLayanan || 50000).toLocaleString(
                    "id-ID",
                  )}
                </span>
              </div>
              <div
                className="lmj-modal-row"
                style={{
                  borderTop: "1px dashed var(--line)",
                  paddingTop: "10px",
                  marginTop: "4px",
                }}
              >
                <span style={{ fontWeight: 600, color: "var(--text)" }}>
                  Total Telah Dibayar:
                </span>
                <strong style={{ color: "var(--gold)", fontSize: "16px" }}>
                  Rp {(selectedOrder.totalBayar || 0).toLocaleString("id-ID")}
                </strong>
              </div>
            </div>

            {/* QR Code Verification Simulation */}
            <div className="rw-eticket-qr-box">
              <div className="rw-qr-mock">
                <svg width="60" height="60" viewBox="0 0 100 100">
                  <rect width="100" height="100" fill="#fff" />
                  <path
                    d="M10 10h24v24h-24z M14 14h16v16h-16z M18 18h8v8h-8z M66 10h24v24h-24z M70 14h16v16h-16z M74 18h8v8h-8z M10 66h24v24h-24z M14 70h16v16h-16z M18 74h8v8h-8z M42 10h6v6h-6z M52 10h6v12h-6z M42 22h6v6h-6z M42 34h12v6h-12z M10 42h6v18h-6z M22 42h12v6h-12z M28 54h6v6h-6z M66 42h18v6h-18z M74 54h16v6h-16z M42 46h16v12h-16z M42 66h6v18h-6z M54 66h12v6h-12z M74 74h16v16h-16z M54 82h12v8h-12z"
                    fill="#15171D"
                  />
                  <rect
                    x="44"
                    y="44"
                    width="12"
                    height="12"
                    rx="3"
                    fill="#C6A24C"
                  />
                </svg>
              </div>
              <div className="rw-qr-desc">
                <strong>Verifikasi QR Serah Terima</strong>
                <p>
                  Tunjukkan kode QR ini ke petugas concierge saat pengambilan
                  unit di showroom atau lokasi pengantaran.
                </p>
              </div>
            </div>

            <div className="lmj-modal-btns">
              <button
                type="button"
                className="lmj-submit-btn"
                onClick={() => {
                  showNotification("📄 Mengunduh E-Tiket PDF resmi...");
                }}
              >
                Unduh E-Tiket &amp; Invoice (PDF)
              </button>

              <button
                type="button"
                className="lmj-demo-btn"
                style={{ padding: "12px", width: "100%" }}
                onClick={() => setSelectedOrder(null)}
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL KONFIRMASI PEMBATALAN ── */}
      {cancelingOrder && (
        <div
          className="lmj-modal-overlay"
          onClick={() => setCancelingOrder(null)}
        >
          <div
            className="lmj-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "460px" }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid #ef4444",
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                margin: "0 auto 18px auto",
              }}
            >
              ⚠️
            </div>
            <h2 className="lmj-modal-title" style={{ fontSize: "22px" }}>
              Batalkan Reservasi?
            </h2>
            <p className="lmj-modal-desc">
              Apakah Anda yakin ingin membatalkan pesanan untuk armada{" "}
              <strong>{cancelingOrder.mobil?.nama}</strong> ({cancelingOrder.id}
              )?
            </p>
            <p
              style={{
                fontSize: "12.5px",
                color: "var(--muted)",
                marginBottom: "20px",
              }}
            >
              Dana pembayaran Anda termasuk deposit jaminan akan dikembalikan
              sesuai kebijakan pembatalan dalam 1x24 jam.
            </p>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <button
                type="button"
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  padding: "13px 20px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
                onClick={handleConfirmBatal}
              >
                Ya, Konfirmasi Batalkan Pesanan
              </button>
              <button
                type="button"
                className="lmj-btn lmj-btn--outline lmj-btn--full"
                onClick={() => setCancelingOrder(null)}
              >
                Kembali / Jangan Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST NOTIFIKASI ── */}
      {toast && (
        <div className="lmj-toast">
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
