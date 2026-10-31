// src/pages/Katalog.jsx
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

export default function Katalog() {
  const navigate = useNavigate();

  return (
    <div>
      <span className="eyebrow">ARMADA KAMI</span>
      <h1 className="h1-title">Katalog Mobil Premium</h1>
      <p className="subtitle" style={{ marginBottom: "32px" }}>
        Pilih kendaraan impian Anda untuk kenyamanan perjalanan terbaik.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "24px",
        }}
      >
        {daftarMobil.map((mobil) => (
          <div
            key={mobil.id}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: "12px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <img
              src={mobil.img}
              alt={mobil.nama}
              style={{ width: "100%", height: "160px", objectFit: "cover" }}
            />
            <div
              style={{
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
              <h3 style={{ fontSize: "16px", color: "var(--text)" }}>
                {mobil.nama}
              </h3>
              <p
                className="subtitle"
                style={{ fontSize: "12.5px", margin: "4px 0 16px" }}
              >
                {mobil.spek}
              </p>
              <div
                style={{
                  marginTop: "auto",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p
                    style={{
                      fontWeight: "600",
                      color: "var(--gold)",
                      fontSize: "15px",
                    }}
                  >
                    Rp {mobil.harga.toLocaleString("id-ID")}
                  </p>
                  <span className="subtitle" style={{ fontSize: "11px" }}>
                    / hari
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-gold"
                  style={{ padding: "8px 14px", fontSize: "12.5px" }}
                  onClick={() => navigate(`/sewa/${mobil.id}`)}
                >
                  Sewa Sekarang
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
