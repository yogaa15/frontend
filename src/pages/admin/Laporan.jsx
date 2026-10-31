import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import AdminTopbar from "../../components/AdminTopbar";
import { getAllOrders, fetchOrdersFromBackend } from "../../services/bookingService";

export default function Laporan() {
  const [selectedRange, setSelectedRange] = useState("6 Bulan Terakhir");
  const [isRangeOpen, setIsRangeOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrdersFromBackend().then((data) => {
      setOrders(data || getAllOrders());
    }).catch(() => {
      setOrders(getAllOrders());
    });

    const handleUpdate = () => {
      setOrders(getAllOrders());
    };
    window.addEventListener("orders_updated", handleUpdate);
    return () => window.removeEventListener("orders_updated", handleUpdate);
  }, []);

  const rangeOptions = [
    "1 Bulan Terakhir",
    "3 Bulan Terakhir",
    "6 Bulan Terakhir",
    "1 Tahun Terakhir",
  ];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const reportData = {
    "1 Bulan Terakhir": {
      total: "Rp 184,2 Juta",
      delta: "+12.4%",
      isUp: true,
      chartData: [
        { label: "M1", height: "45%" },
        { label: "M2", height: "65%" },
        { label: "M3", height: "85%" },
        { label: "M4", height: "100%", hi: true },
      ],
      mobilTerlaris: [
        { rank: 1, nama: "Toyota Avanza Veloz 1.5", jumlahSewa: 16, persentase: "100%" },
        { rank: 2, nama: "Toyota Kijang Innova Reborn", jumlahSewa: 13, persentase: "81%" },
        { rank: 3, nama: "Honda Brio RS", jumlahSewa: 10, persentase: "62%" },
        { rank: 4, nama: "Toyota Hiace Commuter", jumlahSewa: 8, persentase: "50%" },
        { rank: 5, nama: "Mitsubishi Pajero Sport", jumlahSewa: 6, persentase: "37%" },
      ],
    },
    "3 Bulan Terakhir": {
      total: "Rp 542,8 Juta",
      delta: "+10.2%",
      isUp: true,
      chartData: [
        { label: "Jul", height: "55%" },
        { label: "Agu", height: "85%" },
        { label: "Sep", height: "100%", hi: true },
      ],
      mobilTerlaris: [
        { rank: 1, nama: "Toyota Avanza Veloz 1.5", jumlahSewa: 38, persentase: "100%" },
        { rank: 2, nama: "Toyota Kijang Innova Reborn", jumlahSewa: 31, persentase: "82%" },
        { rank: 3, nama: "Honda Brio RS", jumlahSewa: 25, persentase: "66%" },
        { rank: 4, nama: "Toyota Hiace Commuter", jumlahSewa: 19, persentase: "50%" },
        { rank: 5, nama: "Mitsubishi Pajero Sport", jumlahSewa: 14, persentase: "37%" },
      ],
    },
    "6 Bulan Terakhir": {
      total: "Rp 1,04 Miliar",
      delta: "+9.8%",
      isUp: true,
      chartData: [
        { label: "Apr", height: "58%" },
        { label: "Mei", height: "64%" },
        { label: "Jun", height: "72%" },
        { label: "Jul", height: "50%" },
        { label: "Agu", height: "85%" },
        { label: "Sep", height: "100%", hi: true },
      ],
      mobilTerlaris: [
        { rank: 1, nama: "Toyota Avanza Veloz 1.5", jumlahSewa: 68, persentase: "100%" },
        { rank: 2, nama: "Toyota Kijang Innova Reborn", jumlahSewa: 55, persentase: "81%" },
        { rank: 3, nama: "Honda Brio RS", jumlahSewa: 44, persentase: "65%" },
        { rank: 4, nama: "Toyota Hiace Commuter", jumlahSewa: 34, persentase: "50%" },
        { rank: 5, nama: "Mitsubishi Pajero Sport", jumlahSewa: 26, persentase: "38%" },
      ],
    },
    "1 Tahun Terakhir": {
      total: "Rp 1,98 Miliar",
      delta: "+18.5%",
      isUp: true,
      chartData: [
        { label: "Q1", height: "60%" },
        { label: "Q2", height: "78%" },
        { label: "Q3", height: "92%" },
        { label: "Q4", height: "100%", hi: true },
      ],
      mobilTerlaris: [
        { rank: 1, nama: "Toyota Avanza Veloz 1.5", jumlahSewa: 128, persentase: "100%" },
        { rank: 2, nama: "Toyota Kijang Innova Reborn", jumlahSewa: 104, persentase: "81%" },
        { rank: 3, nama: "Honda Brio RS", jumlahSewa: 85, persentase: "66%" },
        { rank: 4, nama: "Toyota Hiace Commuter", jumlahSewa: 64, persentase: "50%" },
        { rank: 5, nama: "Mitsubishi Pajero Sport", jumlahSewa: 49, persentase: "38%" },
      ],
    },
  };

  const defaultReport = reportData[selectedRange] || reportData["6 Bulan Terakhir"];
  
  // Hitung total pendapatan riil dari data pesanan backend
  const liveRevenueNum = orders.reduce((acc, curr) => {
    const rawVal = curr.totalHarga ?? curr.total ?? curr.total_amount ?? 0;
    const num = typeof rawVal === "number" ? rawVal : parseInt(String(rawVal).replace(/\D/g, "") || "0", 10);
    return acc + num;
  }, 0);

  // Hitung utilisasi mobil dari pesanan nyata
  const carUsage = {};
  orders.forEach((o) => {
    const carName = o.namaMobil || o.car_name || "Toyota Avanza Veloz";
    carUsage[carName] = (carUsage[carName] || 0) + 1;
  });

  const sortedCars = Object.entries(carUsage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxSewa = sortedCars.length > 0 ? sortedCars[0][1] : 1;
  const dynamicMobilTerlaris = sortedCars.length > 0
    ? sortedCars.map(([nama, jumlahSewa], idx) => ({
        rank: idx + 1,
        nama,
        jumlahSewa,
        persentase: `${Math.round((jumlahSewa / maxSewa) * 100)}%`,
      }))
    : defaultReport.mobilTerlaris;

  const currentReport = {
    ...defaultReport,
    total: orders.length > 0 ? `Rp ${liveRevenueNum.toLocaleString("id-ID")}` : defaultReport.total,
    mobilTerlaris: dynamicMobilTerlaris,
  };

  const handlePrintReport = () => {
    showToast("🖨️ Menyiapkan dokumen laporan keuangan & armada...");
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="admin-shell">
      <AdminSidebar />

      <div className="admin-main">
        {/* Topbar Reusable (Search dihapus, ada notifikasi & logout fungsional) */}
        <AdminTopbar
          title="Laporan & Statistik"
          subtitle="Pendapatan dan performa mobil paling sering disewa."
        />

        {/* Konten Laporan */}
        <main className="admin-content">
          <div className="admin-head">
            <div>
              <h1 className="serif">Laporan Keuangan & Armada</h1>
              <p>Analisis tren pendapatan dan performa utilisasi armada kendaraan.</p>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {/* Tombol Cetak Dokumen */}
              <button
                type="button"
                className="range-select"
                onClick={handlePrintReport}
                title="Cetak atau simpan Laporan ke PDF"
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
                <span>Unduh / Cetak PDF</span>
              </button>

              {/* Tombol Pemilih Rentang Waktu (Fungsional) */}
              <div className="range-dropdown-wrapper">
                <button
                  type="button"
                  className="range-select"
                  onClick={() => setIsRangeOpen(!isRangeOpen)}
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
                          showToast(`Laporan diperbarui: ${opt}`);
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
          </div>

          {/* Panel Grafik Pendapatan */}
          <div className="panel" style={{ marginBottom: "20px" }}>
            <div className="panel-head">
              <h3>Ringkasan Pendapatan</h3>
              <span className="tag">Periode: {selectedRange}</span>
            </div>
            <div className="revenue-total">
              <span className="num">{currentReport.total}</span>
              <span className={`delta ${currentReport.isUp ? "up" : "down"}`}>
                {currentReport.delta}
              </span>
            </div>
            <div className="bar-chart" style={{ height: "180px" }}>
              {currentReport.chartData.map((barItem) => (
                <div className="col" key={barItem.label}>
                  <div
                    className={`bar ${barItem.hi ? "hi" : ""}`}
                    style={{
                      height: barItem.height,
                      transition: "height 0.4s ease",
                    }}
                    title={`${barItem.label}: ${barItem.height}`}
                  ></div>
                  <span className="m">{barItem.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Panel Mobil Terlaris */}
          <div className="panel">
            <div className="panel-head">
              <h3>Mobil Terlaris</h3>
              <span className="tag">Berdasarkan Jumlah Sewa ({selectedRange})</span>
            </div>
            {currentReport.mobilTerlaris.map((item) => (
              <div className="rank-row" key={item.rank}>
                <span className="num">#{item.rank}</span>
                <div className="info">
                  <div className="name">
                    <span>{item.nama}</span>
                    <b
                      style={{
                        color: "var(--muted)",
                        fontWeight: 500,
                        fontSize: "12.5px",
                      }}
                    >
                      {item.jumlahSewa} kali disewa
                    </b>
                  </div>
                  <div className="track">
                    <div
                      className="fill"
                      style={{
                        width: item.persentase,
                        transition: "width 0.4s ease",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="admin-toast">
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
