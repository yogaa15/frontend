// src/pages/SewaMobil.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const daftarMobil = [
  {
    id: 1,
    nama: "Mercedes-Benz C-Class",
    spek: "Sedan • Matic • 4 Kursi",
    harga: 1250000,
    img: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 2,
    nama: "Toyota Alphard",
    spek: "MPV Premium • Matic • 7 Kursi",
    harga: 1950000,
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRApuIpZHmPuKCzKv92W_QeFD8YUD0c91slGxEcY3o2PPEaA6jMMfeCGsM&s=10",
  },
  {
    id: 3,
    nama: "Honda CR-V",
    spek: "SUV • Matic • 7 Kursi",
    harga: 650000,
    img: "https://upload.wikimedia.org/wikipedia/commons/c/c3/2018_Honda_CR-V_%28RW_MY18%29_%2BSport_2WD_wagon_%282018-10-22%29_01.jpg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original",
  },
  {
    id: 4,
    nama: "Mini Cooper S",
    spek: "Hatchback • Matic • 4 Kursi",
    harga: 850000,
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnBnPs6jEQRbmrVft3wEFcFrZ6BckuVaUpcvIEn61_Gs1Y5NugaVmtPew1&s=10",
  },
  {
    id: 5,
    nama: "Hyundai Ioniq 5",
    spek: "Mobil Listrik (EV) • Matic • 5 Kursi",
    harga: 1100000,
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSenbMuim1Gw4zErF4uDTn_fQuI-ZMTfiKzX8fBT35cMA&s=10",
  },
  {
    id: 6,
    nama: "Mitsubishi Pajero Sport",
    spek: "SUV Tangguh • Matic • 7 Kursi",
    harga: 900000,
    img: "https://upload.wikimedia.org/wikipedia/commons/0/08/2017_Mitsubishi_Pajero_Sport_%28QE%29_GLS_wagon_%282018-08-06%29_01.jpg?utm_source=id.wikipedia.org&utm_campaign=index&utm_content=original",
  },
  {
    id: 7,
    nama: "Toyota Avanza",
    spek: "MPV Keluarga • Manual • 7 Kursi",
    harga: 350000,
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVcvGFvLthBnWVCGZAL4mMkggFqI-XSa5ylz2NWZSUHJQKvJwvo1Hg_hU&s=10",
  },
  {
    id: 8,
    nama: "Porsche 911 Carrera",
    spek: "Sport Premium • Matic • 2 Kursi",
    harga: 4500000,
    img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=400",
  },
];

export default function SewaMobil() {
  const navigate = useNavigate();
  const [mobilTerpilih, setMobilTerpilih] = useState(daftarMobil[0]);

  const [tglAmbil, setTglAmbil] = useState("2026-09-25T09:00");
  const [tglKembali, setTglKembali] = useState("2026-09-28T09:00");

  const hitungDurasi = () => {
    const ambil = new Date(tglAmbil);
    const kembali = new Date(tglKembali);
    const selisihWaktu = kembali.getTime() - ambil.getTime();
    const selisihHari = Math.ceil(selisihWaktu / (1000 * 3600 * 24));
    return selisihHari > 0 ? selisihHari : 1;
  };

  const durasiHari = hitungDurasi();
  const totalSewa = mobilTerpilih.harga * durasiHari;

  const handleLanjutPembayaran = () => {
    navigate("/pembayaran", {
      state: {
        mobil: mobilTerpilih,
        tglAmbil,
        tglKembali,
        durasi: durasiHari,
        totalSewa: totalSewa,
      },
    });
  };

  return (
    <div>
      <span className="eyebrow">Langkah 1 dari 2</span>
      <h1 className="h1-title">Pilih Mobil & Jadwal</h1>
      <p className="subtitle" style={{ marginBottom: "32px" }}>
        Ketersediaan diperbarui setiap saat berdasarkan cabang yang Anda pilih.
      </p>

      <div
        style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}
      >
        {/* Kolom Kiri: Daftar Pilihan Mobil */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {daftarMobil.map((mobil) => {
            const isSelected = mobilTerpilih.id === mobil.id;
            return (
              <div
                key={mobil.id}
                onClick={() => setMobilTerpilih(mobil)}
                style={{
                  background: "var(--surface)",
                  border: isSelected
                    ? "1px solid var(--gold)"
                    : "1px solid var(--line)",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  gap: "16px",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "border-color 0.2s ease",
                }}
              >
                <img
                  src={mobil.img}
                  alt={mobil.nama}
                  style={{
                    width: "120px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "16px", color: "var(--text)" }}>
                    {mobil.nama}
                  </h3>
                  <p
                    className="subtitle"
                    style={{ fontSize: "13px", marginTop: "4px" }}
                  >
                    {mobil.spek}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p
                    style={{
                      fontWeight: "600",
                      color: isSelected ? "var(--gold)" : "var(--text)",
                    }}
                  >
                    Rp {mobil.harga.toLocaleString("id-ID")}
                  </p>
                  <span className="subtitle" style={{ fontSize: "12px" }}>
                    / hari
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Kolom Kanan: Panel Ringkasan Pemesanan */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "12px",
            padding: "24px",
            height: "fit-content",
            position: "sticky",
            top: "24px",
          }}
        >
          <h3
            className="wordmark"
            style={{ fontSize: "18px", marginBottom: "20px" }}
          >
            Ringkasan Pemesanan
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <div>
              <label
                className="label-form"
                style={{ fontSize: "12px", marginBottom: "4px" }}
              >
                Tanggal Ambil
              </label>
              <input
                type="datetime-local"
                value={tglAmbil}
                onChange={(e) => setTglAmbil(e.target.value)}
                className="input-text"
                style={{ padding: "8px 12px", fontSize: "13.5px" }}
              />
            </div>
            <div>
              <label
                className="label-form"
                style={{ fontSize: "12px", marginBottom: "4px" }}
              >
                Tanggal Kembali
              </label>
              <input
                type="datetime-local"
                value={tglKembali}
                onChange={(e) => setTglKembali(e.target.value)}
                className="input-text"
                style={{ padding: "8px 12px", fontSize: "13.5px" }}
              />
            </div>
          </div>

          <hr style={{ borderColor: "var(--line)", margin: "16px 0" }} />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              fontSize: "13.5px",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="subtitle">Mobil dipilih</span>
              <span style={{ textAlign: "right", fontWeight: "500" }}>
                {mobilTerpilih.nama}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="subtitle">Durasi</span>
              <span>{durasiHari} hari</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="subtitle">Tarif harian</span>
              <span>Rp {mobilTerpilih.harga.toLocaleString("id-ID")}</span>
            </div>
            <div
              style={{
                display: "flex",
                justify: "space-between",
                marginTop: "8px",
                fontWeight: "bold",
              }}
            >
              <span>Total</span>
              <span style={{ color: "var(--gold)", fontSize: "16px" }}>
                Rp {totalSewa.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn-gold"
            style={{ width: "100%" }}
            onClick={handleLanjutPembayaran}
          >
            Lanjut ke Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
}
