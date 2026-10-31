import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation, useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  daftarMobilMagelang as daftarMobilDefault,
  kategoriMobilOptions,
} from "../data/mobilMagelang";
import { carAPI } from "../services/api";
import "./SewaMobil.css";

/* ── Scroll Reveal Hook ── */
function useScrollReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── Keunggulan Item ── */
function KeunggulanItem({ num, title, desc, delay }) {
  const [ref, vis] = useScrollReveal(0.1);
  return (
    <div
      ref={ref}
      className={`lmj-keunggulan__item ${vis ? "reveal" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span className="lmj-keunggulan__num">{num}.</span>
      <h4 className="lmj-keunggulan__item-title">{title}</h4>
      <p className="lmj-keunggulan__item-desc">{desc}</p>
    </div>
  );
}

/* ── Animated Counter ── */
function AnimatedPrice({ value }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current;
    const to = value;
    if (from === to) return;
    const dur = 450;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * ease));
      if (p < 1) requestAnimationFrame(tick);
      else prev.current = to;
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <>Rp {display.toLocaleString("id-ID")}</>;
}

/* ── Kartu Mobil ── */
function MobilCard({ mobil, isSelected, onPilih, delay }) {
  const [ref, visible] = useScrollReveal(0.08);
  const isAvailable = mobil.unitTersedia > 0;

  return (
    <div
      ref={ref}
      className={`lmj-card ${visible ? "lmj-card--visible" : ""} ${isSelected ? "lmj-card--active" : ""
        } ${!isAvailable ? "lmj-card--out-of-stock" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
      onClick={() => onPilih(mobil)}
    >
      {/* Gambar & Badges */}
      <div className="lmj-card__img-box">
        <img
          src={mobil.img}
          alt={mobil.nama}
          className="lmj-card__img"
          loading="lazy"
          onError={(e) => {
            e.target.src = "/cars/avanza-veloz.jpg";
          }}
        />
        <div className="lmj-card__img-gradient" />

        {/* Badges */}
        <div className="lmj-card__badges">
          <span className="lmj-badge-cat">{mobil.kategori}</span>
          <span className="lmj-badge-rating">★ {mobil.rating}</span>
          {isAvailable ? (
            <span className="lmj-badge-stock lmj-badge-stock--available">
              <span className="lmj-stock-dot" /> {mobil.unitTersedia} Siap
            </span>
          ) : (
            <span className="lmj-badge-stock lmj-badge-stock--empty">
              <span className="lmj-stock-dot red" /> Unit Habis
            </span>
          )}
        </div>

        {isSelected && (
          <div className="lmj-card__badge-selected">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 7.5l3.5 3.5L12 4"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Dipilih
          </div>
        )}
      </div>

      {/* Info */}
      <div className="lmj-card__content">
        <h3 className="lmj-card__nama">{mobil.nama}</h3>

        <div className="lmj-card__spek-tags">
          <span className="lmj-spek-chip">⚙️ {mobil.transmisi}</span>
          <span className="lmj-spek-chip">👥 {mobil.kursi} Kursi</span>
          {mobil.bbm && <span className="lmj-spek-chip">⛽ {mobil.bbm}</span>}
        </div>

        {/* Ketersediaan Unit: Tersedia vs Tidak Tersedia */}
        <div className="lmj-card__stock-box">
          <div className="lmj-stock-row">
            <span className="lmj-stock-item available">
              <span>🟢</span>
              <span>Tersedia: <strong>{mobil.unitTersedia} Unit</strong></span>
            </span>
            <span className="lmj-stock-item unavailable">
              <span>⏳</span>
              <span>Tidak Tersedia: <strong>{mobil.unitTidakTersedia} Unit</strong></span>
            </span>
          </div>
          <div className="lmj-stock-bar" title={`${mobil.unitTersedia} dari ${mobil.totalUnit} unit tersedia`}>
            <div
              className={`lmj-stock-bar-fill ${!isAvailable ? "empty" : ""}`}
              style={{
                width: `${Math.round((mobil.unitTersedia / mobil.totalUnit) * 100)}%`,
              }}
            />
          </div>
          <div className="lmj-stock-meta">
            <span>Total Armada: {mobil.totalUnit} Unit</span>
            <span className="lmj-stock-percent">
              {isAvailable
                ? `${Math.round((mobil.unitTersedia / mobil.totalUnit) * 100)}% Tersedia`
                : "Sedang Disewa Semua"}
            </span>
          </div>
        </div>

        <div className="lmj-card__footer">
          <div className="lmj-card__price">
            <span className="lmj-card__price-val">
              Rp {mobil.harga.toLocaleString("id-ID")},-
            </span>
            <span className="lmj-card__price-unit">/hari</span>
          </div>
          <button
            type="button"
            className={`lmj-card__btn ${
              !isAvailable
                ? "lmj-card__btn--disabled"
                : isSelected
                  ? "lmj-card__btn--active"
                  : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onPilih(mobil);
            }}
          >
            {!isAvailable
              ? "Unit Habis"
              : isSelected
                ? "✓ Terpilih"
                : "Pilih Mobil"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Beranda({ autoScrollToCatalog = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  const [daftarMobil, setDaftarMobil] = useState(() => {
    try {
      const saved = localStorage.getItem("selaras_armada_admin");
      return saved ? JSON.parse(saved) : daftarMobilDefault;
    } catch {
      return daftarMobilDefault;
    }
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobilTerpilih, setMobilTerpilih] = useState(() => {
    const list = (() => {
      try {
        const saved = localStorage.getItem("selaras_armada_admin");
        return saved ? JSON.parse(saved) : daftarMobilDefault;
      } catch {
        return daftarMobilDefault;
      }
    })();
    if (id) {
      const match = list.find((m) => String(m.id) === String(id));
      if (match) return match;
    }
    return list[0];
  });
  const [tglAmbil, setTglAmbil] = useState("2026-09-25T09:00");
  const [tglKembali, setTglKembali] = useState("2026-09-28T09:00");

  // Sinkronisasi data armada mobil langsung dari backend API
  useEffect(() => {
    let isMounted = true;
    async function syncCarsWithBackend() {
      try {
        const res = await carAPI.getAllCars();
        if (isMounted && res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((m) => {
            const h = Number(
              m.harga_harian !== undefined && m.harga_harian !== null
                ? m.harga_harian
                : m.harga || 0
            );
            const statusRaw = (m.status || "tersedia").toLowerCase();
            const isTersedia = statusRaw === "tersedia" || statusRaw === "available";
            return {
              ...m,
              harga: h,
              harga_harian: h,
              img: m.image_url || m.img || "/cars/avanza-veloz.jpg",
              image_url: m.image_url || m.img || "/cars/avanza-veloz.jpg",
              totalUnit: m.totalUnit || 8,
              unitTersedia: m.unitTersedia !== undefined ? m.unitTersedia : (isTersedia ? 6 : 0),
              unitTidakTersedia: m.unitTidakTersedia !== undefined ? m.unitTidakTersedia : (isTersedia ? 2 : 8),
              rating: m.rating || 4.9,
              transmisi: m.transmisi || (m.spek && m.spek.toLowerCase().includes("matic") ? "Matic" : "Manual"),
              kursi: m.kursi || 7,
              bbm: m.bbm || (m.spek && m.spek.toLowerCase().includes("diesel") ? "Diesel" : "Bensin"),
              kategori: m.kategori || "MPV",
              plat: m.plat || `AA ${m.id} MLG`,
              status: isTersedia ? "tersedia" : (statusRaw === "servis" ? "servis" : "disewa"),
            };
          });
          setDaftarMobil(mapped);
          try {
            localStorage.setItem("selaras_armada_admin", JSON.stringify(mapped));
          } catch {}
          setMobilTerpilih((curr) => {
            if (id) {
              const byId = mapped.find((item) => String(item.id) === String(id));
              if (byId) return byId;
            }
            const match = mapped.find((item) => String(item.id) === String(curr?.id));
            return match || mapped[0];
          });
        }
      } catch {
        // Fallback ke daftarMobilDefault
      }
    }

    syncCarsWithBackend();

    // Auto-refresh data secara instan saat jendela/tab difokuskan atau saat admin mengedit armada
    const handleRefresh = () => syncCarsWithBackend();
    window.addEventListener("focus", handleRefresh);
    window.addEventListener("storage", handleRefresh);
    window.addEventListener("armada_updated", handleRefresh);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("storage", handleRefresh);
      window.removeEventListener("armada_updated", handleRefresh);
    };
  }, [id]);

  /* ── Filter & Search States ── */
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("Semua");
  const [selectedTransmisi, setSelectedTransmisi] = useState("Semua");
  const [selectedKursi, setSelectedKursi] = useState("Semua");
  const [selectedKetersediaan, setSelectedKetersediaan] = useState("Semua");
  const [sortBy, setSortBy] = useState("default");

  /* ── Fleet Total Statistics ── */
  const totalArmadaUnit = useMemo(() => {
    return daftarMobil.reduce((acc, m) => acc + (m.totalUnit || 0), 0);
  }, [daftarMobil]);

  const totalUnitTersedia = useMemo(() => {
    return daftarMobil.reduce((acc, m) => acc + (m.unitTersedia || 0), 0);
  }, [daftarMobil]);

  const totalUnitTidakTersedia = useMemo(() => {
    return daftarMobil.reduce((acc, m) => acc + (m.unitTidakTersedia || 0), 0);
  }, [daftarMobil]);

  /* refs for scroll reveal */
  const [heroRef, heroVis] = useScrollReveal(0.1);
  const [formRef, formVis] = useScrollReveal(0.15);
  const [panelRef, panelVis] = useScrollReveal(0.15);
  const [keunggulanRef, keunggulanVis] = useScrollReveal(0.1);

  // Pre-select car if :id parameter changes in URL
  useEffect(() => {
    if (id) {
      const match = daftarMobil.find((m) => String(m.id) === String(id));
      if (match && match.id !== mobilTerpilih.id) {
        setMobilTerpilih(match);
      }
    }
  }, [id, mobilTerpilih.id, daftarMobil]);

  // Smooth scroll to catalog or booking if requested
  useEffect(() => {
    const shouldScrollCatalog =
      autoScrollToCatalog ||
      location.hash === "#katalog-mobil" ||
      location.hash === "#mobil-list" ||
      location.pathname.startsWith("/sewa");

    if (shouldScrollCatalog) {
      const timer = setTimeout(() => {
        const el = document.getElementById("katalog-mobil");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 180);
      return () => clearTimeout(timer);
    } else if (location.hash === "#booking") {
      const timer = setTimeout(() => {
        const el = document.getElementById("booking");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [autoScrollToCatalog, location.hash, location.pathname]);

  const scrollToCatalog = () => {
    const el = document.getElementById("katalog-mobil");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToBooking = () => {
    const el = document.getElementById("booking");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePilihMobil = (mobil) => {
    setMobilTerpilih(mobil);
    // Smoothly scroll down to booking section
    scrollToBooking();
  };

  /* ── Filter Logic ── */
  const kategoriOptions = useMemo(() => kategoriMobilOptions, []);

  const mobilTersaring = useMemo(() => {
    return daftarMobil
      .filter((mobil) => {
        // 1. Text Search (nama, spek, kategori, bbm)
        const q = searchQuery.toLowerCase().trim();
        if (q) {
          const matchNama = mobil.nama.toLowerCase().includes(q);
          const matchSpek = mobil.spek.toLowerCase().includes(q);
          const matchKategori = mobil.kategori.toLowerCase().includes(q);
          const matchTransmisi = mobil.transmisi.toLowerCase().includes(q);
          const matchBBM = mobil.bbm
            ? mobil.bbm.toLowerCase().includes(q)
            : false;
          if (
            !matchNama &&
            !matchSpek &&
            !matchKategori &&
            !matchTransmisi &&
            !matchBBM
          ) {
            return false;
          }
        }

        // 2. Kategori Filter
        if (selectedKategori !== "Semua") {
          if (mobil.kategori !== selectedKategori) {
            return false;
          }
        }

        // 3. Transmisi Filter
        if (selectedTransmisi !== "Semua") {
          if (mobil.transmisi !== selectedTransmisi) {
            return false;
          }
        }

        // 4. Kursi Filter
        if (selectedKursi !== "Semua") {
          if (selectedKursi === "5" && mobil.kursi !== 5) return false;
          if (selectedKursi === "7" && mobil.kursi !== 7) return false;
          if (selectedKursi === "15" && mobil.kursi < 10) return false;
        }

        // 5. Ketersediaan Filter (Tersedia vs Tidak Tersedia)
        if (selectedKetersediaan !== "Semua") {
          if (selectedKetersediaan === "Tersedia" && mobil.unitTersedia === 0) {
            return false;
          }
          if (
            selectedKetersediaan === "Tidak-Tersedia" &&
            mobil.unitTersedia > 0
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "harga-asc") return a.harga - b.harga;
        if (sortBy === "harga-desc") return b.harga - a.harga;
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "nama") return a.nama.localeCompare(b.nama);
        return 0;
      });
  }, [
    daftarMobil,
    searchQuery,
    selectedKategori,
    selectedTransmisi,
    selectedKursi,
    selectedKetersediaan,
    sortBy,
  ]);

  const handleResetFilter = () => {
    setSearchQuery("");
    setSelectedKategori("Semua");
    setSelectedTransmisi("Semua");
    setSelectedKursi("Semua");
    setSelectedKetersediaan("Semua");
    setSortBy("default");
  };

  const isFiltered =
    searchQuery.trim() !== "" ||
    selectedKategori !== "Semua" ||
    selectedTransmisi !== "Semua" ||
    selectedKursi !== "Semua" ||
    selectedKetersediaan !== "Semua" ||
    sortBy !== "default";

  const hitungDurasi = useCallback(() => {
    const ms = new Date(tglKembali) - new Date(tglAmbil);
    const d = Math.ceil(ms / 86400000);
    return d > 0 ? d : 1;
  }, [tglAmbil, tglKembali]);

  const durasiHari = hitungDurasi();
  const totalSewa = mobilTerpilih.harga * durasiHari;

  const handleLanjut = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    navigate("/pembayaran", {
      state: {
        mobil: mobilTerpilih,
        tglAmbil,
        tglKembali,
        durasi: durasiHari,
        totalSewa,
      },
    });
  };

  return (
    <div className="lmj-page">
      {/* ══════ HERO BANNER (DITARUH KE BERANDA) ══════ */}
      <section ref={heroRef} className={`lmj-hero ${heroVis ? "reveal" : ""}`}>
        <div className="lmj-hero__bg">
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1400"
            alt="Hero Car"
            className="lmj-hero__bg-img"
          />
          <div className="lmj-hero__bg-overlay" />
        </div>

        <div className="lmj-hero__content">
          <span className="lmj-hero__tag">SEWA MOBIL PREMIUM</span>
          <h1 className="lmj-hero__title">Bisa Lepas Kunci</h1>
          <p className="lmj-hero__desc">
            Melayani rental mobil premium dengan sopir atau lepas kunci.
            Kualitas mobil terbaik, sopir sopan &amp; berpengalaman.
          </p>
          <div className="lmj-hero__btns">
            <button
              type="button"
              className="lmj-btn lmj-btn--gold"
              onClick={scrollToCatalog}
            >
              Lihat Mobil
            </button>
            <button
              type="button"
              className="lmj-btn lmj-btn--outline"
              onClick={scrollToBooking}
            >
              Pesan Sekarang
            </button>
          </div>
        </div>

        {/* Floating car silhouette animation */}
        <div className="lmj-hero__float-car">
          <img
            src="/cars/innova-zenix.jpg"
            alt="Armada Selaras Magelang"
          />
        </div>
      </section>

      {/* ══════ PROFIL / KEUNGGULAN SECTION ══════ */}
      <section
        ref={keunggulanRef}
        className={`lmj-section lmj-keunggulan ${keunggulanVis ? "reveal" : ""
          }`}
      >
        <div className="lmj-section__header">
          <span className="lmj-section__tag">KENAPA MEMILIH KAMI</span>
          <h2 className="lmj-section__title">Rental Mobil Terpercaya</h2>
          <p className="lmj-section__desc">
            Kami adalah rental mobil dengan fasilitas dan kualitas terbaik untuk
            kenyamanan perjalanan Anda.
          </p>
        </div>
        <div className="lmj-keunggulan__grid">
          {[
            {
              num: "01",
              title: "Mobil Nyaman",
              desc: "Mobil nyaman dan terawat sehingga perjalanan Anda menyenangkan.",
            },
            {
              num: "02",
              title: "Mobil Aman",
              desc: "Mobil dirawat secara berkala, siap jalan aman dan nyaman.",
            },
            {
              num: "03",
              title: "Harga Terjangkau",
              desc: "Harga terjangkau sebanding dengan kualitas armada terbaik.",
            },
            {
              num: "04",
              title: "Bisa Lepas Kunci",
              desc: "Tersedia opsi lepas kunci dengan verifikasi cepat & mudah.",
            },
          ].map((item, i) => (
            <KeunggulanItem
              key={i}
              num={item.num}
              title={item.title}
              desc={item.desc}
              delay={i * 100}
            />
          ))}
        </div>
      </section>

      {/* ══════ KATALOG MOBIL (DENGAN FITUR SEARCH & FILTER) ══════ */}
      <section id="katalog-mobil" className="lmj-section">
        <div className="lmj-section__header">
          <span className="lmj-section__tag">ARMADA KAMI</span>
          <h2 className="lmj-section__title">Pilih Mobil Impian Anda</h2>
          <p className="lmj-section__desc">
            Banyak ragam pilihan mobil mewah, bisa lepas kunci atau include driver.
          </p>
        </div>

        {/* ── Banner Ringkasan Ketersediaan Armada Real-Time ── */}
        <div className="lmj-fleet-stock-banner">
          <div className="lmj-fleet-stock-item">
            <span className="lmj-fleet-stock-icon">🚗</span>
            <div>
              <strong className="lmj-fleet-stock-val">{totalArmadaUnit} Unit</strong>
              <span className="lmj-fleet-stock-lbl">Total Armada Selaras</span>
            </div>
          </div>
          <div className="lmj-fleet-stock-divider" />
          <div className="lmj-fleet-stock-item">
            <span className="lmj-fleet-stock-icon">🟢</span>
            <div>
              <strong className="lmj-fleet-stock-val" style={{ color: "#10b981" }}>
                {totalUnitTersedia} Unit
              </strong>
              <span className="lmj-fleet-stock-lbl">Unit Tersedia Siap Sewa</span>
            </div>
          </div>
          <div className="lmj-fleet-stock-divider" />
          <div className="lmj-fleet-stock-item">
            <span className="lmj-fleet-stock-icon">⏳</span>
            <div>
              <strong className="lmj-fleet-stock-val" style={{ color: "#f59e0b" }}>
                {totalUnitTidakTersedia} Unit
              </strong>
              <span className="lmj-fleet-stock-lbl">Unit Tidak Tersedia (Disewa/Perjalanan)</span>
            </div>
          </div>
        </div>

        {/* ── Toolbar Search & Filter ── */}
        <div className="lmj-catalog-filter">
          {/* 1. Kolom Pencarian */}
          <div className="lmj-search-box">
            <span className="lmj-search-icon">🔍</span>
            <input
              type="text"
              className="lmj-search-input"
              placeholder="Cari mobil berdasarkan nama, tipe, transmisi (cth: Alphard, Sedan, Matic, Listrik)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="lmj-search-clear"
                onClick={() => setSearchQuery("")}
                title="Hapus pencarian"
              >
                ✕
              </button>
            )}
          </div>

          {/* 2. Kategori Pills / Tabs */}
          <div className="lmj-category-tabs">
            {kategoriOptions.map((kategori) => {
              const count =
                kategori === "Semua"
                  ? daftarMobil.length
                  : daftarMobil.filter((m) => m.kategori === kategori).length;
              return (
                <button
                  key={kategori}
                  type="button"
                  className={`lmj-tab-pill ${selectedKategori === kategori ? "active" : ""
                    }`}
                  onClick={() => setSelectedKategori(kategori)}
                >
                  <span>{kategori}</span>
                  <span className="lmj-tab-count">{count}</span>
                </button>
              );
            })}
          </div>

          {/* 3. Secondary Dropdown Filters */}
          <div className="lmj-filter-options">
            <div className="lmj-filter-group">
              <label className="lmj-filter-label">⚙️ Transmisi</label>
              <select
                className="lmj-filter-select"
                value={selectedTransmisi}
                onChange={(e) => setSelectedTransmisi(e.target.value)}
              >
                <option value="Semua">Semua Transmisi</option>
                <option value="Matic">Matic (Otomatis)</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            <div className="lmj-filter-group">
              <label className="lmj-filter-label">👥 Kapasitas Kursi</label>
              <select
                className="lmj-filter-select"
                value={selectedKursi}
                onChange={(e) => setSelectedKursi(e.target.value)}
              >
                <option value="Semua">Semua Kapasitas</option>
                <option value="5">5 Kursi (City Car / Crossover / EV)</option>
                <option value="7">7 Kursi (MPV / SUV Keluarga)</option>
                <option value="15">15 Kursi (Minibus Hiace Wisata)</option>
              </select>
            </div>

            <div className="lmj-filter-group">
              <label className="lmj-filter-label">🏷️ Status Ketersediaan</label>
              <select
                className="lmj-filter-select"
                value={selectedKetersediaan}
                onChange={(e) => setSelectedKetersediaan(e.target.value)}
              >
                <option value="Semua">Semua Ketersediaan ({daftarMobil.length} Model)</option>
                <option value="Tersedia">Hanya Unit Tersedia ({daftarMobil.filter(m => m.unitTersedia > 0).length} Model)</option>
                <option value="Tidak-Tersedia">Unit Tidak Tersedia / Disewa ({daftarMobil.filter(m => m.unitTersedia === 0).length} Model)</option>
              </select>
            </div>

            <div className="lmj-filter-group">
              <label className="lmj-filter-label">↕ Urutkan Harga / Nama</label>
              <select
                className="lmj-filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Rekomendasi Terbaik</option>
                <option value="harga-asc">Harga Terendah (Termurah)</option>
                <option value="harga-desc">Harga Tertinggi (Termahal)</option>
                <option value="rating">Rating Tertinggi ★</option>
                <option value="nama">Nama Mobil (A - Z)</option>
              </select>
            </div>
          </div>

          {/* 4. Filter Summary & Reset */}
          <div className="lmj-filter-summary">
            <div className="lmj-filter-count">
              Menampilkan <strong>{mobilTersaring.length}</strong> dari{" "}
              <strong>{daftarMobil.length}</strong> armada tersedia
              {searchQuery && (
                <span>
                  {" "}
                  untuk pencarian "<em>{searchQuery}</em>"
                </span>
              )}
            </div>

            {isFiltered && (
              <button
                type="button"
                className="lmj-filter-reset-btn"
                onClick={handleResetFilter}
              >
                ✕ Reset Filter & Pencarian
              </button>
            )}
          </div>
        </div>

        {/* ── Grid Hasil Mobil ── */}
        {mobilTersaring.length > 0 ? (
          <div className="lmj-grid">
            {mobilTersaring.map((mobil, i) => (
              <MobilCard
                key={mobil.id}
                mobil={mobil}
                isSelected={mobilTerpilih.id === mobil.id}
                onPilih={handlePilihMobil}
                delay={i * 60}
              />
            ))}
          </div>
        ) : (
          <div className="lmj-empty-state">
            <span className="lmj-empty-icon">🚗🔍</span>
            <h3 className="lmj-empty-title">Armada Tidak Ditemukan</h3>
            <p className="lmj-empty-desc">
              Tidak ada armada mobil yang cocok dengan kriteria pencarian atau
              filter yang Anda pilih. Silakan sesuaikan kata kunci atau reset filter.
            </p>
            <button
              type="button"
              className="lmj-btn lmj-btn--gold"
              onClick={handleResetFilter}
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </section>

      {/* ══════ BOOKING / RINGKASAN PEMESANAN ══════ */}
      <section id="booking" className="lmj-section lmj-booking-section">
        <div className="lmj-section__header">
          <span className="lmj-section__tag">LANGKAH 1 DARI 2</span>
          <h2 className="lmj-section__title">Atur Jadwal Sewa</h2>
          <p className="lmj-section__desc">
            Sesuaikan tanggal sewa dan periksa ringkasan sebelum lanjut ke pembayaran.
          </p>
        </div>

        <div className="lmj-booking">
          {/* Form tanggal */}
          <div
            ref={formRef}
            className={`lmj-booking__form ${formVis ? "reveal" : ""}`}
          >
            <div className="lmj-booking__input-group">
              <label className="lmj-label">📅 Tanggal Pengambilan</label>
              <input
                type="datetime-local"
                value={tglAmbil}
                onChange={(e) => setTglAmbil(e.target.value)}
                className="lmj-input"
              />
            </div>
            <div className="lmj-booking__arrow">→</div>
            <div className="lmj-booking__input-group">
              <label className="lmj-label">📅 Tanggal Pengembalian</label>
              <input
                type="datetime-local"
                value={tglKembali}
                onChange={(e) => setTglKembali(e.target.value)}
                className="lmj-input"
              />
            </div>
          </div>

          {/* Panel ringkasan */}
          <div
            ref={panelRef}
            className={`lmj-summary ${panelVis ? "reveal" : ""}`}
          >
            {/* Preview mobil terpilih */}
            <div className="lmj-summary__preview">
              <img
                key={mobilTerpilih.id}
                src={mobilTerpilih.img}
                alt={mobilTerpilih.nama}
                className="lmj-summary__preview-img"
                onError={(e) => {
                  e.target.src = "/cars/avanza-veloz.jpg";
                }}
              />
              <div className="lmj-summary__preview-overlay">
                <span className="lmj-summary__preview-name">
                  {mobilTerpilih.nama}
                </span>
              </div>
            </div>

            <div className="lmj-summary__body">
              <h3 className="lmj-summary__title">Ringkasan Pemesanan</h3>

              <div className="lmj-summary__rows">
                <div className="lmj-summary__row">
                  <span>Mobil Dipilih</span>
                  <strong>{mobilTerpilih.nama}</strong>
                </div>
                <div className="lmj-summary__row">
                  <span>Tarif Harian</span>
                  <strong>
                    Rp {mobilTerpilih.harga.toLocaleString("id-ID")},-
                  </strong>
                </div>
                <div className="lmj-summary__row">
                  <span>Durasi Sewa</span>
                  <strong>{durasiHari} hari</strong>
                </div>
                <div className="lmj-summary__row">
                  <span>Status Ketersediaan</span>
                  {mobilTerpilih.unitTersedia > 0 ? (
                    <strong style={{ color: "#10b981" }}>
                      🟢 {mobilTerpilih.unitTersedia} Unit Tersedia ({mobilTerpilih.unitTidakTersedia} Sedang Disewa)
                    </strong>
                  ) : (
                    <strong style={{ color: "#ef4444" }}>
                      🔴 0 Unit Tersedia (Semua {mobilTerpilih.totalUnit} Unit Sedang Disewa)
                    </strong>
                  )}
                </div>
                <hr className="lmj-summary__hr" />
                <div className="lmj-summary__row lmj-summary__row--total">
                  <span>Total Biaya</span>
                  <strong>
                    <AnimatedPrice value={totalSewa} />
                  </strong>
                </div>
              </div>

              {mobilTerpilih.unitTersedia === 0 && (
                <div className="lmj-summary-unavailable-alert">
                  ⚠️ Mohon maaf, saat ini semua unit <strong>{mobilTerpilih.nama}</strong> sedang disewa pelanggan lain. Silakan pilih armada lain di katalog yang berstatus tersedia.
                </div>
              )}

              <button
                type="button"
                className={`lmj-btn lmj-btn--full ${
                  mobilTerpilih.unitTersedia === 0
                    ? "lmj-btn--disabled"
                    : "lmj-btn--gold"
                }`}
                disabled={mobilTerpilih.unitTersedia === 0}
                onClick={handleLanjut}
              >
                {mobilTerpilih.unitTersedia === 0
                  ? "Unit Sedang Tidak Tersedia"
                  : "Lanjut ke Pembayaran"}
                {mobilTerpilih.unitTersedia > 0 && (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M4 9h10M10 5l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ 4 LANGKAH CARA SEWA ══════ */}
      <section className="lmj-section">
        <div className="lmj-section__header">
          <span className="lmj-section__tag">PROSES CEPAT & MUDAH</span>
          <h2 className="lmj-section__title">4 Langkah Mudah Sewa Mobil</h2>
          <p className="lmj-section__desc">
            Sewa armada impian Anda tanpa ribet, proses instan dan transparan
            seperti standar LMJ Rent Car.
          </p>
        </div>
        <div className="lmj-steps__grid">
          <div className="lmj-step-card">
            <div className="lmj-step-badge">
              <span>01</span>
              <div className="lmj-step-icon">🚗</div>
            </div>
            <h4 className="lmj-step-title">Pilih Armada</h4>
            <p className="lmj-step-desc">
              Tentukan mobil favorit dari kategori sedan, SUV, MPV, EV, atau sport
              yang sesuai gaya perjalanan Anda.
            </p>
          </div>
          <div className="lmj-step-card">
            <div className="lmj-step-badge">
              <span>02</span>
              <div className="lmj-step-icon">📅</div>
            </div>
            <h4 className="lmj-step-title">Atur Jadwal & Opsi</h4>
            <p className="lmj-step-desc">
              Tentukan tanggal pengambilan dan durasi sewa, pilih layanan Lepas
              Kunci atau Include Driver.
            </p>
          </div>
          <div className="lmj-step-card">
            <div className="lmj-step-badge">
              <span>03</span>
              <div className="lmj-step-icon">💳</div>
            </div>
            <h4 className="lmj-step-title">Pembayaran Kilat</h4>
            <p className="lmj-step-desc">
              Selesaikan pembayaran via Virtual Account, QRIS, atau Kartu Kredit
              dengan enkripsi aman.
            </p>
          </div>
          <div className="lmj-step-card">
            <div className="lmj-step-badge">
              <span>04</span>
              <div className="lmj-step-icon">✨</div>
            </div>
            <h4 className="lmj-step-title">Serah Terima Unit</h4>
            <p className="lmj-step-desc">
              Unit diantar tepat waktu langsung ke rumah, kantor, hotel, atau
              bandara dalam kondisi prima.
            </p>
          </div>
        </div>
      </section>

      {/* ══════ STATISTIK PENCAPAIAN BANNER ══════ */}
      <div className="lmj-stats-banner">
        <div className="lmj-stats-grid">
          <div className="lmj-stat-box">
            <div className="lmj-stat-num">50+</div>
            <div className="lmj-stat-label">Armada Mewah Terawat</div>
            <div className="lmj-stat-sub">Servis resmi ATPM berkala</div>
          </div>
          <div className="lmj-stat-box">
            <div className="lmj-stat-num">12.500+</div>
            <div className="lmj-stat-label">Perjalanan Sukses</div>
            <div className="lmj-stat-sub">Pelanggan puas se-Indonesia</div>
          </div>
          <div className="lmj-stat-box">
            <div className="lmj-stat-num">99.8%</div>
            <div className="lmj-stat-label">Ketepatan Serah Terima</div>
            <div className="lmj-stat-sub">Garansi on-time handover</div>
          </div>
          <div className="lmj-stat-box">
            <div className="lmj-stat-num">24/7</div>
            <div className="lmj-stat-label">Layanan Derek Siaga</div>
            <div className="lmj-stat-sub">Mekanik & towing darurat</div>
          </div>
        </div>
      </div>

      {/* ══════ CALL TO ACTION BANNER ══════ */}
      <div className="lmj-cta-box">
        <h2 className="lmj-cta-title">Siap Memulai Perjalanan Istimewa Anda?</h2>
        <p className="lmj-cta-desc">
          Dapatkan penawaran terbaik dan ketersediaan unit premium hari ini. Tim concierge kami siap melayani Anda 24 jam setiap hari.
        </p>
        <div className="lmj-cta-actions">
          <button
            type="button"
            className="lmj-btn lmj-btn--gold"
            onClick={scrollToCatalog}
          >
            Pesan Sekarang ➔
          </button>
          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin%20Selaras,%20saya%20tertarik%20sewa%20mobil"
            target="_blank"
            rel="noopener noreferrer"
            className="lmj-btn lmj-btn--outline"
          >
            Konsultasi WhatsApp 💬
          </a>
        </div>
      </div>

      {/* ══════ LUXURY FOOTER ══════ */}
      <footer className="lmj-footer">
        <div className="lmj-footer-grid">
          <div>
            <div className="lmj-footer-brand-title">
              <span style={{ color: "var(--gold)", fontSize: "22px" }}>✦</span>
              <span className="wordmark" style={{ fontSize: "22px" }}>
                Selaras
              </span>
            </div>
            <p className="lmj-footer-desc">
              Penyedia layanan rental mobil mewah, eksekutif, dan keluarga
              terpercaya di Indonesia. Menghadirkan kenyamanan kelas satu dengan
              standar armada terbaik dan supir berpengalaman.
            </p>

          </div>

          <div>
            <h4 className="lmj-footer-heading">Armada Unggulan</h4>
            <ul className="lmj-footer-links">
              <li>
                <a
                  href="#katalog-mobil"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToCatalog();
                  }}
                >
                  Toyota Avanza Veloz 1.5
                </a>
              </li>
              <li>
                <a
                  href="#katalog-mobil"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToCatalog();
                  }}
                >
                  Toyota Kijang Innova Reborn
                </a>
              </li>
              <li>
                <a
                  href="#katalog-mobil"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToCatalog();
                  }}
                >
                  Toyota Hiace Commuter (Wisata Borobudur)
                </a>
              </li>
              <li>
                <a
                  href="#katalog-mobil"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToCatalog();
                  }}
                >
                  Toyota Alphard Transformer VIP
                </a>
              </li>
              <li>
                <a
                  href="#katalog-mobil"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToCatalog();
                  }}
                >
                  Hyundai Ioniq 5 Electric (EV)
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="lmj-footer-heading">Layanan Kami</h4>
            <ul className="lmj-footer-links">
              <li>
                <a
                  href="#booking"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToBooking();
                  }}
                >
                  Rental Lepas Kunci
                </a>
              </li>

              <li>
                <Link to="/tentang">Tentang Kami &amp; Lokasi</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="lmj-footer-heading">Kontak &amp; Showroom</h4>
            <div className="lmj-footer-contact-item">
              <span>📍</span>
              <div>
                <strong>Magelang</strong>
                Jl. Magelang - Yogyakarta KM 7, Mertoyudan, Magelang, Jawa Tengah
              </div>
            </div>

            <div className="lmj-footer-contact-item">
              <span>📞</span>
              <div>
                <strong>Hotline Bebas Pulsa</strong>
                (021) 555-0182 / +62 812-3456-7890
              </div>
            </div>
            <div className="lmj-footer-contact-item">
              <span>✉️</span>
              <div>
                <strong>Email Resmi</strong>
                reservasi@selaras.id
              </div>
            </div>
          </div>
        </div>

        <div className="lmj-footer-bottom">
          <div>
            © 2026 Selaras Rental Mobil Premium. Seluruh Hak Cipta Dilindungi.
          </div>
          <div className="lmj-footer-bottom-links">
            <a href="#terms">Syarat & Ketentuan</a>
            <a href="#privacy">Kebijakan Privasi</a>
            <a href="#insurance">Garansi Asuransi</a>
          </div>
        </div>
      </footer>

      {/* ── Modal Login Jika Belum Masuk Akun ── */}
      {showLoginModal && (
        <div className="lmj-modal-overlay">
          <div className="lmj-modal-card" style={{ maxWidth: "440px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(198, 162, 76, 0.15)",
                border: "1px solid var(--gold)",
                color: "var(--gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                margin: "0 auto 18px auto",
              }}
            >
              🔒
            </div>
            <h2 className="lmj-modal-title" style={{ fontSize: "22px" }}>
              Masuk untuk Melanjutkan
            </h2>
            <p className="lmj-modal-desc">
              Untuk mengunci pesanan <strong>{mobilTerpilih.nama}</strong> dan
              melanjutkan ke tahap pembayaran, Anda harus masuk ke akun terlebih
              dahulu.
            </p>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <button
                type="button"
                className="lmj-btn lmj-btn--gold lmj-btn--full"
                onClick={() => {
                  navigate("/login", {
                    state: {
                      from: "/pembayaran",
                      bookingData: {
                        mobil: mobilTerpilih,
                        tglAmbil,
                        tglKembali,
                        durasi: durasiHari,
                        totalSewa,
                      },
                      message:
                        "Silakan masuk ke akun Anda untuk melanjutkan pembayaran armada.",
                    },
                  });
                }}
              >
                Masuk ke Akun Saya ➔
              </button>

              <button
                type="button"
                className="lmj-btn lmj-btn--outline lmj-btn--full"
                onClick={() => {
                  navigate("/register");
                }}
              >
                Belum Punya Akun? Daftar di Sini ✦
              </button>

              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--muted)",
                  fontSize: "13px",
                  cursor: "pointer",
                  marginTop: "8px",
                }}
              >
                Nanti Saja / Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ FLOATING WHATSAPP ══════ */}
      <a
        href="https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20sewa%20mobil"
        target="_blank"
        rel="noopener noreferrer"
        className="lmj-wa-float"
        title="Chat WhatsApp"
      >
        <span className="lmj-wa-float__pulse" />
        <svg viewBox="0 0 32 32" width="28" height="28" fill="#fff">
          <path d="M16.004 2.667A13.29 13.29 0 002.67 15.958a13.17 13.17 0 001.786 6.624L2.667 29.333l7.005-1.838A13.28 13.28 0 0016.004 29.3 13.3 13.3 0 0029.333 16 13.3 13.3 0 0016.004 2.667zm0 24.278a11.02 11.02 0 01-5.618-1.538l-.403-.239-4.176 1.096 1.115-4.074-.263-.418A10.95 10.95 0 014.92 16 11.09 11.09 0 0116.004 4.92 11.09 11.09 0 0127.084 16a11.09 11.09 0 01-11.08 10.945zm6.072-8.192c-.333-.167-1.97-.972-2.275-1.083-.306-.111-.528-.167-.75.167-.222.333-.861 1.083-1.056 1.306-.194.222-.389.25-.722.083-.333-.167-1.407-.518-2.68-1.652-.99-.882-1.658-1.972-1.852-2.305-.194-.333-.02-.514.146-.68.15-.149.333-.389.5-.583.167-.194.222-.333.333-.556.111-.222.056-.417-.028-.583-.083-.167-.75-1.806-1.028-2.472-.27-.65-.546-.562-.75-.573l-.639-.011a1.226 1.226 0 00-.889.417c-.306.333-1.167 1.139-1.167 2.778s1.194 3.222 1.361 3.444c.167.222 2.352 3.593 5.7 5.038.797.344 1.418.55 1.903.704.799.254 1.527.218 2.102.132.641-.096 1.97-.806 2.248-1.583.278-.778.278-1.445.194-1.584-.083-.139-.305-.222-.638-.389z" />
        </svg>
      </a>
    </div>
  );
}
