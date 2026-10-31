// src/pages/admin/CekTransaksi.jsx
import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import AdminTopbar from "../../components/AdminTopbar";
import { getAllOrders, fetchOrdersFromBackend, updateOrderStatus } from "../../services/bookingService";

export default function CekTransaksi() {
  const [transaksi, setTransaksi] = useState(() => getAllOrders());
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [toast, setToast] = useState(null);

  const filterOptions = ["Semua Status", "Lunas", "Pending", "Selesai", "Dibatalkan"];

  useEffect(() => {
    let isMounted = true;
    async function loadOrders() {
      const data = await fetchOrdersFromBackend();
      if (isMounted && data && Array.isArray(data)) {
        setTransaksi(data);
      }
    }
    loadOrders();

    const handleUpdate = () => {
      setTransaksi(getAllOrders());
    };
    window.addEventListener("orders_updated", handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("orders_updated", handleUpdate);
    };
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Toggle status transaksi antara pending, lunas, dan selesai
  const handleToggleStatus = (id) => {
    const item = transaksi.find((t) => t.id === id);
    if (!item) return;

    const currentStatus = (item.status || "pending").toLowerCase();
    const nextStatusMap = {
      pending: "lunas",
      lunas: "selesai",
      selesai: "pending",
      dibatalkan: "pending",
    };
    const nextStatus = nextStatusMap[currentStatus] || "lunas";

    updateOrderStatus(id, nextStatus);
    showToast(`✓ Status transaksi ${id} diubah menjadi ${nextStatus.toUpperCase()}`);
  };

  // Unduh / Cetak Laporan
  const handlePrint = () => {
    showToast("🖨️ Menyiapkan dokumen ringkasan transaksi untuk dicetak...");
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const normalizedTransaksi = transaksi.map((item) => ({
    id: item.id,
    pelanggan: item.pelanggan || item.userName || "Pelanggan Selaras",
    email: item.userEmail || item.email || "-",
    telepon: item.telepon || "0812-3456-7890",
    av: item.av || (item.pelanggan || item.userName || "PS").slice(0, 2).toUpperCase(),
    mobil: item.mobil?.nama || item.namaMobil || "Armada Selaras",
    plat: item.mobil?.plat || item.plat || "AA 8817 ZA",
    tgl: item.tgl || (item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "28 Sep 2026"),
    durasi: item.durasiHari || `${item.durasi || 1} Hari`,
    total: typeof item.total === "number" ? item.total : (typeof item.totalBayar === "number" ? item.totalBayar : 1000000),
    status: (item.status || "lunas").toLowerCase(),
    metode: item.metodePembayaran || item.metode || "Virtual Account",
    lokasiAmbil: item.lokasiAmbil || "Showroom Selaras Mertoyudan Magelang",
    layanan: item.layanan || "Lepas Kunci (Self Drive)",
  }));

  const filteredTransaksi = normalizedTransaksi.filter((item) => {
    if (statusFilter === "Semua Status") return true;
    return item.status.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="admin-shell">
      <AdminSidebar />

      <div className="admin-main">
        {/* Topbar: Search dihapus, notifikasi & logout fungsional */}
        <AdminTopbar
          title="Cek Transaksi"
          subtitle="Daftar seluruh transaksi pemesanan dan verifikasi status pembayaran."
        />

        <main className="admin-content">
          <div className="admin-head">
            <div>
              <h1 className="serif">Cek Transaksi</h1>
              <p>
                Semua transaksi sewa yang masuk, lengkap dengan status
                pembayarannya.
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {/* Tombol Cetak / Ekspor */}
              <button
                type="button"
                className="range-select"
                onClick={handlePrint}
                title="Cetak Rekapitulasi Transaksi"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                  <path d="M6 14h12v8H6z" />
                </svg>
                <span>Cetak Rekap</span>
              </button>

              {/* Tombol Dropdown Filter Status Fungsional */}
              <div className="range-dropdown-wrapper">
                <button
                  type="button"
                  className="range-select"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <span>{statusFilter}</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{
                      transform: isFilterOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="#8D8F98"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {isFilterOpen && (
                  <div className="range-dropdown-menu">
                    {filterOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`range-option-item ${
                          statusFilter === opt ? "active" : ""
                        }`}
                        onClick={() => {
                          setStatusFilter(opt);
                          setIsFilterOpen(false);
                        }}
                      >
                        {opt}
                        {statusFilter === opt && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="panel">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Pelanggan</th>
                  <th>Mobil</th>
                  <th>Tanggal</th>
                  <th>Total</th>
                  <th>Status (Klik ganti)</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransaksi.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "32px", color: "var(--muted)" }}>
                      Tidak ada transaksi dengan status {statusFilter}.
                    </td>
                  </tr>
                ) : (
                  filteredTransaksi.map((item) => (
                    <tr key={item.id}>
                      <td style={{ color: "var(--muted)" }}>{item.id}</td>
                      <td>
                        <div className="cust">
                          <span className="av">{item.av}</span>
                          <div>
                            <div style={{ fontWeight: 600 }}>{item.pelanggan}</div>
                            <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                              {item.telepon}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>{item.mobil}</div>
                        <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                          {item.plat}
                        </div>
                      </td>
                      <td style={{ color: "var(--muted)" }}>{item.tgl}</td>
                      <td style={{ fontWeight: 600 }}>Rp {item.total.toLocaleString("id-ID")}</td>
                      <td>
                        <button
                          type="button"
                          className={`badge ${item.status}`}
                          onClick={() => handleToggleStatus(item.id)}
                          title="Klik untuk mengubah status pembayaran"
                          style={{ border: "none", cursor: "pointer" }}
                        >
                          {item.status.toUpperCase()} ⟳
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-btn-sm"
                          onClick={() => setSelectedTx(item)}
                          title="Lihat Detail Transaksi Lengkap"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Modal Detail Transaksi */}
      {selectedTx && (
        <div className="admin-modal-overlay" onClick={() => setSelectedTx(null)}>
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "520px" }}
          >
            <div className="admin-modal-head">
              <h3 className="serif">Kwitansi Pemesanan {selectedTx.id}</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelectedTx(null)}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="detail-item">
                <span className="label">Nama Pelanggan</span>
                <span className="val">{selectedTx.pelanggan}</span>
              </div>
              <div className="detail-item">
                <span className="label">Nomor Telepon</span>
                <span className="val">{selectedTx.telepon}</span>
              </div>
              <div className="detail-item">
                <span className="label">Alamat Email</span>
                <span className="val">{selectedTx.email}</span>
              </div>
              <div className="detail-item">
                <span className="label">Unit Kendaraan</span>
                <span className="val">{selectedTx.mobil} ({selectedTx.plat})</span>
              </div>
              <div className="detail-item">
                <span className="label">Tanggal Sewa</span>
                <span className="val">{selectedTx.tgl}</span>
              </div>
              <div className="detail-item">
                <span className="label">Durasi Pemakaian</span>
                <span className="val">{selectedTx.durasi}</span>
              </div>
              <div className="detail-item">
                <span className="label">Metode Pembayaran</span>
                <span className="val">{selectedTx.metode}</span>
              </div>
              <div className="detail-item">
                <span className="label">Total Pembayaran</span>
                <span className="val" style={{ color: "var(--gold)", fontWeight: 600 }}>
                  Rp {selectedTx.total.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Status Verifikasi</span>
                <button
                  type="button"
                  className={`badge ${selectedTx.status}`}
                  onClick={() => {
                    handleToggleStatus(selectedTx.id);
                    setSelectedTx((prev) => ({
                      ...prev,
                      status: prev.status === "lunas" ? "pending" : "lunas",
                    }));
                  }}
                  style={{ border: "none", cursor: "pointer" }}
                >
                  {selectedTx.status.toUpperCase()} (Ubah)
                </button>
              </div>
            </div>
            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-btn admin-btn-ghost"
                onClick={() => setSelectedTx(null)}
              >
                Tutup
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={() => {
                  window.print();
                }}
              >
                Cetak Bukti Transaksi
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
