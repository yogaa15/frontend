import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import AdminTopbar from "../../components/AdminTopbar";
import { daftarMobilMagelang } from "../../data/mobilMagelang";
import { carAPI } from "../../services/api";

export default function ManajemenMobil() {
  const [armada, setArmada] = useState(() => {
    try {
      const saved = localStorage.getItem("selaras_armada_admin");
      return saved ? JSON.parse(saved) : daftarMobilMagelang;
    } catch {
      return daftarMobilMagelang;
    }
  });

  const [activeFilter, setActiveFilter] = useState("semua");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [deletingCar, setDeletingCar] = useState(null);
  const [toast, setToast] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Sinkronisasi data armada mobil langsung dari backend API (12 mobil)
  useEffect(() => {
    let isMounted = true;
    async function loadArmadaFromBackend() {
      try {
        const response = await carAPI.getAllCars();
        if (response && response.data) {
          const mapped = response.data.map((c) => {
            const statusRaw = (c.status || "tersedia").toLowerCase();
            const isTersedia = statusRaw === "tersedia" || statusRaw === "available";
            const statusNorm = isTersedia ? "tersedia" : statusRaw === "servis" ? "servis" : "disewa";
            return {
              id: c.id,
              nama: c.nama,
              plat: c.plat || `AA ${c.id} MLG`,
              kategori: c.kategori || "MPV",
              harga: Number(c.harga_harian || c.harga || 0),
              status: statusNorm,
              spek: c.spek,
              image_url: c.image_url || c.img,
            };
          });
          setArmada(mapped);
          setIsBackendConnected(true);
          try {
            localStorage.setItem("selaras_armada_admin", JSON.stringify(mapped));
          } catch {}
        }
      } catch {
        if (isMounted) setIsBackendConnected(false);
      }
    }
    loadArmadaFromBackend();
    return () => {
      isMounted = false;
    };
  }, []);

  // Form state untuk Tambah / Edit Mobil
  const [formData, setFormData] = useState({
    nama: "",
    plat: "",
    kategori: "Sedan",
    harga: "",
    status: "tersedia",
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const saveToStorage = (updatedList) => {
    setArmada(updatedList);
    try {
      localStorage.setItem("selaras_armada_admin", JSON.stringify(updatedList));
      // Dispatch custom event agar halaman Beranda dan komponen lain langsung ter-update seketika
      window.dispatchEvent(new Event("armada_updated"));
    } catch (err) {
      console.error(err);
    }
  };

  // Buka Modal Tambah
  const handleOpenAdd = () => {
    setFormData({
      nama: "",
      plat: "",
      kategori: "Sedan",
      harga: "",
      status: "tersedia",
    });
    setIsAddModalOpen(true);
  };

  // Submit Tambah Mobil ke Backend
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama || !formData.plat || !formData.harga) {
      showToast("⚠️ Mohon lengkapi semua bidang.");
      return;
    }

    const payload = {
      nama: formData.nama.trim(),
      plat: formData.plat.trim().toUpperCase(),
      kategori: formData.kategori,
      harga_harian: Number(formData.harga),
      status: formData.status,
    };

    try {
      const response = await carAPI.createCar(payload);
      const newCar = response?.data
        ? {
            id: response.data.id,
            nama: response.data.nama,
            plat: response.data.plat || payload.plat,
            kategori: response.data.kategori || payload.kategori,
            harga: Number(response.data.harga_harian || payload.harga_harian),
            status: response.data.status || payload.status,
          }
        : {
            id: Date.now(),
            ...payload,
            harga: payload.harga_harian,
          };

      const updated = [newCar, ...armada];
      saveToStorage(updated);
      setIsAddModalOpen(false);
      showToast(`✓ Mobil ${newCar.nama} berhasil ditambahkan ke database!`);
    } catch {
      const fallbackCar = {
        id: Date.now(),
        ...payload,
        harga: payload.harga_harian,
      };
      const updated = [fallbackCar, ...armada];
      saveToStorage(updated);
      setIsAddModalOpen(false);
      showToast(`✓ Mobil ${fallbackCar.nama} ditambahkan (Lokal)!`);
    }
  };

  // Buka Modal Edit
  const handleOpenEdit = (car) => {
    setEditingCar(car);
    setFormData({
      nama: car.nama,
      plat: car.plat,
      kategori: car.kategori,
      harga: car.harga || car.harga_harian,
      status: car.status,
    });
  };

  // Submit Edit Mobil ke Backend
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama || !formData.plat || !formData.harga) {
      showToast("⚠️ Mohon lengkapi semua bidang.");
      return;
    }

    const payload = {
      nama: formData.nama.trim(),
      plat: formData.plat.trim().toUpperCase(),
      kategori: formData.kategori,
      harga_harian: Number(formData.harga),
      status: formData.status,
    };

    try {
      const res = await carAPI.updateCar(editingCar.id, payload);
      const serverUpdated = res?.data;
      const updated = armada.map((c) =>
        String(c.id) === String(editingCar.id)
          ? {
              ...c,
              ...(serverUpdated || payload),
              harga: Number(serverUpdated?.harga_harian || payload.harga_harian),
            }
          : c
      );
      saveToStorage(updated);
      setEditingCar(null);
      showToast(`✓ Data mobil ${formData.nama} berhasil diperbarui!`);
    } catch (err) {
      console.warn("Update backend offline, simpan lokal:", err);
      const updated = armada.map((c) =>
        String(c.id) === String(editingCar.id)
          ? {
              ...c,
              ...payload,
              harga: payload.harga_harian,
            }
          : c
      );
      saveToStorage(updated);
      setEditingCar(null);
      showToast(`✓ Data mobil ${formData.nama} berhasil diperbarui (Lokal)!`);
    }
  };

  // Submit Hapus Mobil di Backend
  const handleConfirmDelete = async () => {
    if (!deletingCar) return;

    try {
      await carAPI.deleteCar(deletingCar.id);
    } catch {
      // Abaikan jika offline
    }

    const updated = armada.filter((c) => String(c.id) !== String(deletingCar.id));
    saveToStorage(updated);
    showToast(`✓ Unit ${deletingCar.nama} telah dihapus dari armada.`);
    setDeletingCar(null);
  };

  // Ganti status cepat
  const handleToggleStatus = async (car) => {
    const nextStatusMap = {
      tersedia: "disewa",
      disewa: "servis",
      servis: "tersedia",
    };
    const nextStatus = nextStatusMap[car.status] || "tersedia";
    try {
      await carAPI.updateCar(car.id, {
        nama: car.nama,
        status: nextStatus,
        harga_harian: car.harga_harian || car.harga,
      });
    } catch (err) {
      console.warn("Toggle status error:", err);
    }
    const updated = armada.map((c) =>
      String(c.id) === String(car.id) ? { ...c, status: nextStatus } : c
    );
    saveToStorage(updated);
    showToast(`Status ${car.nama} diubah menjadi ${nextStatus.toUpperCase()}`);
  };

  // Filter armada
  const filteredArmada = armada.filter((item) => {
    if (activeFilter === "semua") return true;
    return item.status.toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <div className="admin-shell">
      <AdminSidebar />

      <div className="admin-main">
        {/* Topbar: Search dihapus, notifikasi & logout fungsional */}
        <AdminTopbar
          title="Manajemen Mobil"
          subtitle="Ubah data, atur status ketersediaan, atau kelola unit armada."
        />

        <main className="admin-content">
          <div className="admin-head">
            <div>
              <h1 className="serif">Manajemen Mobil</h1>
              <p>Kelola unit armada, tarif sewa harian, dan pantau status kesiapan kendaraan.</p>
            </div>

            {/* Tombol Tambah Mobil Fungsional */}
            <button
              type="button"
              className="range-select"
              onClick={handleOpenAdd}
              id="tambah-mobil-btn"
              style={{
                background: "var(--gold)",
                color: "#1A1509",
                fontWeight: "600",
                border: "none",
              }}
            >
              + Tambah Mobil
            </button>
          </div>

          {/* Tab Filter Status */}
          <div className="admin-filter-tabs">
            <button
              type="button"
              className={`filter-tab-btn ${activeFilter === "semua" ? "active" : ""}`}
              onClick={() => setActiveFilter("semua")}
            >
              Semua Unit ({armada.length})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${activeFilter === "tersedia" ? "active" : ""}`}
              onClick={() => setActiveFilter("tersedia")}
            >
              Tersedia ({armada.filter((c) => c.status === "tersedia").length})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${activeFilter === "disewa" ? "active" : ""}`}
              onClick={() => setActiveFilter("disewa")}
            >
              Disewa ({armada.filter((c) => c.status === "disewa").length})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${activeFilter === "servis" ? "active" : ""}`}
              onClick={() => setActiveFilter("servis")}
            >
              Servis ({armada.filter((c) => c.status === "servis").length})
            </button>
          </div>

          <div className="panel">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mobil</th>
                  <th>Plat Nomor</th>
                  <th>Kategori</th>
                  <th>Harga/Hari</th>
                  <th>Status (Klik ganti)</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredArmada.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "32px", color: "var(--muted)" }}>
                      Tidak ada kendaraan dengan status {activeFilter}.
                    </td>
                  </tr>
                ) : (
                  filteredArmada.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <b>{item.nama}</b>
                      </td>
                      <td style={{ color: "var(--muted)" }}>{item.plat}</td>
                      <td style={{ color: "var(--muted)" }}>{item.kategori}</td>
                      <td>Rp {item.harga.toLocaleString("id-ID")}</td>
                      <td>
                        <button
                          type="button"
                          className={`badge ${item.status}`}
                          onClick={() => handleToggleStatus(item)}
                          title="Klik untuk ubah status cepat"
                          style={{ border: "none", cursor: "pointer" }}
                        >
                          {item.status.toUpperCase()} ⟳
                        </button>
                      </td>
                      <td>
                        <div className="actions-cell">
                          {/* Tombol Edit Fungsional */}
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit data mobil"
                            aria-label={`Edit ${item.nama}`}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M4 20l1-4 11-11 3 3-11 11-4 1z"
                                stroke="#C6A24C"
                                strokeWidth="1.6"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          {/* Tombol Hapus Fungsional */}
                          <button
                            type="button"
                            className="icon-btn danger"
                            onClick={() => setDeletingCar(item)}
                            title="Hapus unit mobil"
                            aria-label={`Hapus ${item.nama}`}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13"
                                stroke="#C97575"
                                strokeWidth="1.6"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Modal Tambah Mobil */}
      {isAddModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3 className="serif">+ Tambah Unit Mobil Baru</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsAddModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="admin-modal-body">
                <div className="form-group-admin">
                  <label className="label-form">Nama Mobil & Seri</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Toyota Innova Reborn"
                    className="input-text"
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })
                    }
                  />
                </div>
                <div className="form-group-admin">
                  <label className="label-form">Plat Nomor</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: AA 1234 GA"
                    className="input-text"
                    value={formData.plat}
                    onChange={(e) =>
                      setFormData({ ...formData, plat: e.target.value })
                    }
                  />
                </div>
                <div className="grid-2col-form">
                  <div className="form-group-admin">
                    <label className="label-form">Kategori</label>
                    <select
                      className="input-text select-admin"
                      value={formData.kategori}
                      onChange={(e) =>
                        setFormData({ ...formData, kategori: e.target.value })
                      }
                    >
                      <option value="MPV">MPV</option>
                      <option value="SUV">SUV</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="Minibus">Minibus</option>
                      <option value="Mobil Listrik">Mobil Listrik</option>
                    </select>
                  </div>
                  <div className="form-group-admin">
                    <label className="label-form">Status Awal</label>
                    <select
                      className="input-text select-admin"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      <option value="tersedia">Tersedia</option>
                      <option value="disewa">Disewa</option>
                      <option value="servis">Servis</option>
                    </select>
                  </div>
                </div>
                <div className="form-group-admin">
                  <label className="label-form">Harga Sewa / Hari (Rp)</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 1250000"
                    className="input-text"
                    value={formData.harga}
                    onChange={(e) =>
                      setFormData({ ...formData, harga: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Simpan Mobil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Mobil */}
      {editingCar && (
        <div className="admin-modal-overlay" onClick={() => setEditingCar(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3 className="serif">Edit Data Mobil</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setEditingCar(null)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="admin-modal-body">
                <div className="form-group-admin">
                  <label className="label-form">Nama Mobil & Seri</label>
                  <input
                    type="text"
                    required
                    className="input-text"
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })
                    }
                  />
                </div>
                <div className="form-group-admin">
                  <label className="label-form">Plat Nomor</label>
                  <input
                    type="text"
                    required
                    className="input-text"
                    value={formData.plat}
                    onChange={(e) =>
                      setFormData({ ...formData, plat: e.target.value })
                    }
                  />
                </div>
                <div className="grid-2col-form">
                  <div className="form-group-admin">
                    <label className="label-form">Kategori</label>
                    <select
                      className="input-text select-admin"
                      value={formData.kategori}
                      onChange={(e) =>
                        setFormData({ ...formData, kategori: e.target.value })
                      }
                    >
                      <option value="MPV">MPV</option>
                      <option value="SUV">SUV</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="Minibus">Minibus</option>
                      <option value="Mobil Listrik">Mobil Listrik</option>
                    </select>
                  </div>
                  <div className="form-group-admin">
                    <label className="label-form">Status</label>
                    <select
                      className="input-text select-admin"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      <option value="tersedia">Tersedia</option>
                      <option value="disewa">Disewa</option>
                      <option value="servis">Servis</option>
                    </select>
                  </div>
                </div>
                <div className="form-group-admin">
                  <label className="label-form">Harga Sewa / Hari (Rp)</label>
                  <input
                    type="number"
                    required
                    className="input-text"
                    value={formData.harga}
                    onChange={(e) =>
                      setFormData({ ...formData, harga: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost"
                  onClick={() => setEditingCar(null)}
                >
                  Batal
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Perbarui Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Mobil */}
      {deletingCar && (
        <div className="admin-modal-overlay" onClick={() => setDeletingCar(null)}>
          <div
            className="admin-modal-card admin-logout-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-icon-danger">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13"
                  stroke="#C97575"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="serif">Hapus Unit Mobil?</h3>
            <p>
              Apakah Anda yakin ingin menghapus <b>{deletingCar.nama}</b> ({deletingCar.plat}) dari daftar armada? Data yang dihapus tidak dapat dipulihkan kembali.
            </p>
            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-btn admin-btn-ghost"
                onClick={() => setDeletingCar(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={handleConfirmDelete}
              >
                Ya, Hapus Unit
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
