import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import AdminTopbar from "../../components/AdminTopbar";
import { carAPI } from "../../services/api";
import { getAllOrders, fetchOrdersFromBackend } from "../../services/bookingService";

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [selectedRange, setSelectedRange] = useState("30 Hari Terakhir");
  const [isRangeOpen, setIsRangeOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [liveCars, setLiveCars] = useState([]);
  const [liveOrders, setLiveOrders] = useState(() => getAllOrders());

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        const [carsRes, ordersRes] = await Promise.all([
          carAPI.getAllCars(),
          fetchOrdersFromBackend(),
        ]);
        if (isMounted) {
          if (carsRes?.data && Array.isArray(carsRes.data)) {
            setLiveCars(carsRes.data);
          }
          if (ordersRes && Array.isArray(ordersRes)) {
            setLiveOrders(ordersRes);
          }
        }
      } catch {
        // Fallback
      }
    }
    fetchData();

    const handleUpdate = () => {
      fetchData();
      setLiveOrders(getAllOrders());
    };

    window.addEventListener("armada_updated", handleUpdate);
    window.addEventListener("orders_updated", handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("armada_updated", handleUpdate);
      window.removeEventListener("orders_updated", handleUpdate);
    };
  }, []);

  const rangeOptions = [
    "Hari Ini",
    "7 Hari Terakhir",
    "30 Hari Terakhir",
    "Bulan Ini",
    "Tahun Ini",
  ];

  // Data dinamis berdasarkan range yang dipilih
  const statsData = {
    "Hari Ini": {
      pendapatan: "Rp 8,4jt",
      deltaPendapatan: "+4.2%",
      isPendapatanUp: true,
      mobilDisewa: "14 / 48",
      deltaMobil: "+2",
      isMobilUp: true,
      transaksi: "9",
      deltaTx: "+1",
      isTxUp: true,
      totalPelanggan: "842",
      deltaCust: "+3",
      bars: [30, 45, 60, 40, 80, 50, 70],
    },
    "7 Hari Terakhir": {
      pendapatan: "Rp 56,8jt",
      deltaPendapatan: "+8.1%",
      isPendapatanUp: true,
      mobilDisewa: "26 / 48",
      deltaMobil: "+3",
      isMobilUp: true,
      transaksi: "38",
      deltaTx: "+5.4%",
      isTxUp: true,
      totalPelanggan: "842",
      deltaCust: "+9",
      bars: [45, 55, 65, 75, 90, 85, 70],
    },
    "30 Hari Terakhir": {
      pendapatan: "Rp 184,2jt",
      deltaPendapatan: "+12.4%",
      isPendapatanUp: true,
      mobilDisewa: "32 / 48",
      deltaMobil: "+4",
      isMobilUp: true,
      transaksi: "126",
      deltaTx: "-2.1%",
      isTxUp: false,
      totalPelanggan: "842",
      deltaCust: "+18",
      bars: [52, 68, 45, 80, 100, 74, 60],
    },
    "Bulan Ini": {
      pendapatan: "Rp 192,5jt",
      deltaPendapatan: "+14.0%",
      isPendapatanUp: true,
      mobilDisewa: "34 / 48",
      deltaMobil: "+5",
      isMobilUp: true,
      transaksi: "134",
      deltaTx: "+3.2%",
      isTxUp: true,
      totalPelanggan: "842",
      deltaCust: "+22",
      bars: [58, 70, 52, 85, 95, 80, 68],
    },
    "Tahun Ini": {
      pendapatan: "Rp 1,84 Miliar",
      deltaPendapatan: "+22.5%",
      isPendapatanUp: true,
      mobilDisewa: "32 / 48",
      deltaMobil: "+8",
      isMobilUp: true,
      transaksi: "1.420",
      deltaTx: "+18.3%",
      isTxUp: true,
      totalPelanggan: "842",
      deltaCust: "+145",
      bars: [65, 75, 80, 88, 100, 92, 85],
    },
  };

  const currentStats = statsData[selectedRange] || statsData["30 Hari Terakhir"];

  const transactions = [
    {
      id: "TRX-MLG-84920193",
      pelanggan: "Raka Pradana",
      av: "RP",
      mobil: "Toyota Kijang Innova Reborn",
      tgl: "28 Sep 2026",
      durasi: "3 Hari",
      total: "Rp 1.775.000",
      status: "lunas",
      metode: "BCA Virtual Account",
    },
    {
      id: "TRX-MLG-71930290",
      pelanggan: "Sinta Nuraini",
      av: "SN",
      mobil: "Toyota Avanza Veloz 1.5",
      tgl: "27 Sep 2026",
      durasi: "2 Hari",
      total: "Rp 925.000",
      status: "pending",
      metode: "Mandiri Transfer",
    },
    {
      id: "TRX-MLG-65291048",
      pelanggan: "Budi Wicaksono",
      av: "BW",
      mobil: "Toyota Hiace Commuter",
      tgl: "26 Sep 2026",
      durasi: "1 Hari",
      total: "Rp 1.375.000",
      status: "lunas",
      metode: "QRIS Instant",
    },
  ];

  const displayTransactions = useMemo(() => {
    if (liveOrders && liveOrders.length > 0) {
      return liveOrders.map((tx) => ({
        id: tx.id,
        pelanggan: tx.pelanggan || tx.userName || "Pelanggan Selaras",
        av: tx.av || (tx.pelanggan || tx.userName || "PS").slice(0, 2).toUpperCase(),
        mobil: tx.mobil?.nama || tx.namaMobil || "Armada Selaras",
        tgl: tx.tgl || (tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "28 Sep 2026"),
        durasi: tx.durasiHari || `${tx.durasi || 1} Hari`,
        total: typeof tx.total === "number" ? `Rp ${tx.total.toLocaleString("id-ID")}` : (typeof tx.totalBayar === "number" ? `Rp ${tx.totalBayar.toLocaleString("id-ID")}` : (tx.total || "Rp 0")),
        status: (tx.status || "lunas").toLowerCase(),
        metode: tx.metodePembayaran || tx.metode || "Virtual Account",
      }));
    }
    return transactions;
  }, [liveOrders]);

  const totalIncomeCalculated = useMemo(() => {
    if (!liveOrders || liveOrders.length === 0) return currentStats.pendapatan;
    const sum = liveOrders.reduce((acc, curr) => {
      const val = typeof curr.total === "number" ? curr.total : (typeof curr.totalBayar === "number" ? curr.totalBayar : 0);
      return acc + val;
    }, 0);
    if (sum >= 1000000) {
      return `Rp ${(sum / 1000000).toFixed(1).replace(".", ",")}jt`;
    }
    return `Rp ${sum.toLocaleString("id-ID")}`;
  }, [liveOrders, currentStats.pendapatan]);

  return (
    <div className="admin-shell">
      <AdminSidebar />

      <div className="admin-main">
        {/* Topbar Reusable (Search telah dihapus, ada Logout fungsional dan notifikasi) */}
        <AdminTopbar
          title="Dashboard"
          subtitle="Ringkasan performa rental hari ini, 30 Sep 2026."
        />

        <main className="admin-content">
          <div className="admin-head">
            <div>
              <h1 className="serif">Dashboard</h1>
              <p>Ringkasan performa rental hari ini, 30 Sep 2026.</p>
            </div>

            {/* Tombol Pemilih Rentang Waktu (Fungsional) */}
            <div className="range-dropdown-wrapper">
              <button
                type="button"
                className="range-select"
                onClick={() => setIsRangeOpen(!isRangeOpen)}
                aria-expanded={isRangeOpen}
              >
                <span>{selectedRange}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{
                    transform: isRangeOpen ? "rotate(180deg)" : "rotate(0deg)",
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

              {isRangeOpen && (
                <div className="range-dropdown-menu">
                  {rangeOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`range-option-item ${
                        selectedRange === opt ? "active" : ""
                      }`}
                      onClick={() => {
                        setSelectedRange(opt);
                        setIsRangeOpen(false);
                      }}
                    >
                      {opt}
                      {selectedRange === opt && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Kartu Statistik */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="top-row">
                <span
                  className={`delta ${
                    currentStats.isPendapatanUp ? "up" : "down"
                  }`}
                >
                  {currentStats.deltaPendapatan}
                </span>
              </div>
              <div className="value">{totalIncomeCalculated}</div>
              <div className="label">Total Pendapatan Terverifikasi</div>
            </div>

            <div className="stat-card">
              <div className="top-row">
                <span className="delta up">
                  {liveCars.length > 0 ? `${liveCars.length} Unit Total` : currentStats.deltaMobil}
                </span>
              </div>
              <div className="value">
                {liveCars.length > 0
                  ? `${liveCars.filter((c) => (c.status || "").toLowerCase() === "disewa").length} / ${liveCars.length}`
                  : currentStats.mobilDisewa}
              </div>
              <div className="label">Mobil Sedang Disewa (Backend)</div>
            </div>

            <div className="stat-card">
              <div className="top-row">
                <span
                  className={`delta ${currentStats.isTxUp ? "up" : "down"}`}
                >
                  {currentStats.deltaTx}
                </span>
              </div>
              <div className="value">
                {liveOrders.length > 0 ? `${liveOrders.length} Pesanan` : currentStats.transaksi}
              </div>
              <div className="label">Total Reservasi Masuk</div>
            </div>

            <div className="stat-card">
              <div className="top-row">
                <span className="delta up">{currentStats.deltaCust}</span>
              </div>
              <div className="value">{840 + liveOrders.length}</div>
              <div className="label">Total Pelanggan Terdaftar</div>
            </div>
          </div>

          {/* Chart & Status Armada */}
          <div className="grid-2col">
            <div className="panel">
              <div className="panel-head">
                <h3>Pendapatan Mingguan</h3>
                <span className="tag">● {selectedRange}</span>
              </div>
              <div className="bar-chart">
                {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(
                  (day, index) => {
                    const heightVal = currentStats.bars[index] || 50;
                    const isHighest = heightVal === Math.max(...currentStats.bars);
                    return (
                      <div className="col" key={day}>
                        <div
                          className={`bar ${isHighest ? "hi" : ""}`}
                          style={{
                            height: `${heightVal}%`,
                            transition: "height 0.4s ease",
                          }}
                          title={`${day}: ${heightVal}%`}
                        ></div>
                        <span className="m">{day}</span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Status Armada (Live Backend)</h3>
                <button
                  type="button"
                  className="tag"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={() => navigate("/admin/mobil")}
                >
                  Kelola Armada ({liveCars.length} Unit) →
                </button>
              </div>

              {liveCars.length > 0 ? (
                liveCars.slice(0, 5).map((c) => (
                  <div className="fleet-row" key={c.id}>
                    <div>
                      <div className="name">{c.nama}</div>
                      <div
                        className="plate"
                        style={{ color: "var(--muted)", fontSize: "11.5px" }}
                      >
                        {c.plat || `AA ${c.id} MLG`} • Rp {Number(c.harga_harian || c.harga || 0).toLocaleString("id-ID")}/hari
                      </div>
                    </div>
                    <span className={`badge ${c.status || "tersedia"}`}>
                      {(c.status || "tersedia").toUpperCase()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="fleet-row">
                  <div>
                    <div className="name">Toyota Avanza Veloz 1.5</div>
                    <div className="plate" style={{ color: "var(--muted)", fontSize: "11.5px" }}>AA 1204 GA</div>
                  </div>
                  <span className="badge tersedia">TERSEDIA</span>
                </div>
              )}
            </div>
          </div>

          {/* Tabel Transaksi Terbaru */}
          <div className="panel">
            <div className="panel-head">
              <h3>Transaksi Terbaru (Live Data)</h3>
              <button
                type="button"
                className="tag tag-btn"
                onClick={() => navigate("/admin/transaksi")}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Lihat Semua Transaksi ({displayTransactions.length}) →
              </button>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Pelanggan</th>
                  <th>Mobil</th>
                  <th>Tanggal</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {displayTransactions.slice(0, 5).map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ color: "var(--muted)" }}>{tx.id}</td>
                    <td>
                      <div className="cust">
                        <span className="av">{tx.av}</span>
                        {tx.pelanggan}
                      </div>
                    </td>
                    <td>{tx.mobil}</td>
                    <td style={{ color: "var(--muted)" }}>{tx.tgl}</td>
                    <td style={{ color: "var(--gold)", fontWeight: 600 }}>{tx.total}</td>
                    <td>
                      <span className={`badge ${tx.status}`}>
                        {tx.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-btn-sm"
                        onClick={() => setSelectedTx(tx)}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
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
            style={{ maxWidth: "460px" }}
          >
            <div className="admin-modal-head">
              <h3 className="serif">Detail Transaksi {selectedTx.id}</h3>
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
                <span className="label">Pelanggan</span>
                <span className="val">{selectedTx.pelanggan}</span>
              </div>
              <div className="detail-item">
                <span className="label">Unit Mobil</span>
                <span className="val">{selectedTx.mobil}</span>
              </div>
              <div className="detail-item">
                <span className="label">Tanggal Pemesanan</span>
                <span className="val">{selectedTx.tgl}</span>
              </div>
              <div className="detail-item">
                <span className="label">Durasi Sewa</span>
                <span className="val">{selectedTx.durasi}</span>
              </div>
              <div className="detail-item">
                <span className="label">Metode Pembayaran</span>
                <span className="val">{selectedTx.metode}</span>
              </div>
              <div className="detail-item">
                <span className="label">Total Biaya</span>
                <span className="val" style={{ color: "var(--gold)", fontWeight: 600 }}>
                  {selectedTx.total}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Status</span>
                <span className={`badge ${selectedTx.status}`}>
                  {selectedTx.status.toUpperCase()}
                </span>
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
                  setSelectedTx(null);
                  navigate("/admin/transaksi");
                }}
              >
                Buka di Cek Transaksi →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
