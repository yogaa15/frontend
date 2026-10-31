// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";

// Halaman Pelanggan
import Beranda from "./pages/Beranda";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Pembayaran from "./pages/Pembayaran";
import RiwayatPesanan from "./pages/RiwayatPesanan";
import Tentang from "./pages/Tentang";

// Halaman Admin
import Laporan from "./pages/admin/Laporan";
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import ManajemenMobil from "./pages/admin/ManajemenMobil";
import CekTransaksi from "./pages/admin/CekTransaksi";
import PengaturanAdmin from "./pages/admin/PengaturanAdmin";

function LayoutApp() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="app-container">
      {!isAdmin && <Navbar />}

      <main className={isAdmin ? "" : "main-content"}>
        <Routes>
          <Route path="/" element={<Beranda />} />
          <Route path="/sewa" element={<Beranda autoScrollToCatalog={true} />} />
          <Route path="/sewa/:id" element={<Beranda autoScrollToCatalog={true} />} />
          <Route path="/katalog" element={<Navigate to="/sewa" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pembayaran" element={<Pembayaran />} />
          <Route path="/riwayat" element={<RiwayatPesanan />} />
          <Route path="/pesanan" element={<RiwayatPesanan />} />
          <Route path="/tentang" element={<Tentang />} />
          <Route path="/bantuan" element={<Tentang />} />

          {/* Router Admin */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/laporan" element={<Laporan />} />
          <Route path="/admin/dashboard" element={<DashboardAdmin />} />
          <Route path="/admin/mobil" element={<ManajemenMobil />} />
          <Route path="/admin/transaksi" element={<CekTransaksi />} />
          <Route path="/admin/pengaturan" element={<PengaturanAdmin />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <LayoutApp />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
