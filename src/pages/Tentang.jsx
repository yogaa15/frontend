import { Link } from "react-router-dom";
import "./Tentang.css";

export default function Tentang() {
  return (
    <div className="lmj-about-page">
      {/* ── HERO BANNER ── */}
      <section className="lmj-about-hero">
        <span className="eyebrow">TENTANG SELARAS RENTAL MOBIL</span>
        <h1 className="h1-title">
          Dedikasi Kenyamanan &amp; Kemewahan Berkendara
        </h1>
        <p className="subtitle">
          Selaras didirikan dengan visi menjadi penyedia layanan sewa mobil
          premium nomor satu di Indonesia. Kami menghadirkan unit mewah yang
          selalu prima, sopir profesional berpengalaman, dan kemudahan sewa
          lepas kunci tanpa prosedur berbelit.
        </p>
      </section>

      {/* ── STATS COUNTER BAR ── */}
      <div className="lmj-about-stats">
        <div className="lmj-about-stat-card">
          <div className="lmj-about-stat-val">5+</div>
          <div className="lmj-about-stat-lbl">Tahun Pengalaman</div>
          <div className="lmj-about-stat-sub">Melayani sejak 2026</div>
        </div>
        <div className="lmj-about-stat-card">
          <div className="lmj-about-stat-val">50+</div>
          <div className="lmj-about-stat-lbl">Armada Premium</div>
          <div className="lmj-about-stat-sub">Servis resmi ATPM berkala</div>
        </div>
        <div className="lmj-about-stat-card">
          <div className="lmj-about-stat-val">12.500+</div>
          <div className="lmj-about-stat-lbl">Perjalanan Sukses</div>
          <div className="lmj-about-stat-sub">Tamu VIP & keluarga puas</div>
        </div>
        <div className="lmj-about-stat-card">
          <div className="lmj-about-stat-val">99.8%</div>
          <div className="lmj-about-stat-lbl">On-Time Handover</div>
          <div className="lmj-about-stat-sub">Garansi tepat waktu</div>
        </div>
      </div>

      {/* ── KISAH KAMI & VISI MISI ── */}
      <div className="lmj-about-story">
        <div className="lmj-about-story-text">
          <span className="eyebrow">PROFIL PERUSAHAAN</span>
          <h2>Kenyamanan Tanpa Kompromi di Setiap Kilometer</h2>
          <p>
            Berawal dari kebutuhan akan transportasi eksekutif yang bersih,
            terawat, dan memiliki standar pelayanan hospitality bintang lima,
            Selaras hadir untuk melengkapi perjalanan bisnis maupun liburan
            Anda.
          </p>
          <p>
            Setiap unit mobil kami menjalani inspeksi kelayakan 40 titik sebelum
            diserahterimakan kepada Anda. Ditunjang dengan perlindungan asuransi
            komprehensif (All-Risk) dan tim mekanik darurat 24 jam, Anda dapat
            menikmati perjalanan dengan ketenangan pikiran sepenuhnya.
          </p>
          <div style={{ marginTop: "24px" }}>
            <Link to="/#katalog-mobil" className="lmj-btn lmj-btn--gold">
              Jelajahi Armada Kami ➔
            </Link>
          </div>
        </div>

        <div className="lmj-about-story-img-box">
          <img
            src="https://media.istockphoto.com/id/2171315771/id/foto/mobil-untuk-bepergian-dengan-jalan-pegunungan.jpg?s=612x612&w=0&k=20&c=hEmtPznEsov5MpjCaeH7c4IeRX1tuZ0mX6fek8G9U3I="
            alt="Armada Mewah Selaras"
            className="lmj-about-story-img"
          />
          <div className="lmj-about-story-badge">
            <div>
              <strong>Garansi Kebersihan &amp; Keamanan</strong>
              <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                Sterilisasi kabin penuh sebelum penyerahan unit
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3 PILAR KEUNGGULAN ── */}
      <div className="lmj-values-section">
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <span className="eyebrow">NILAI-NILAI UTAMA</span>
          <h2 className="h1-title" style={{ fontSize: "28px" }}>
            Mengapa Memilih Selaras?
          </h2>
        </div>

        <div className="lmj-values-grid">
          <div className="lmj-value-card">
            <div className="lmj-value-icon">💎</div>
            <h3>Armada Mewah &amp; Terawat</h3>
            <p>
              Pilihan mobil dari kelas MPV keluarga nyaman, SUV tangguh, hingga
              sedan mewah dan mobil listrik. Seluruh unit diservis berkala di
              bengkel resmi ATPM.
            </p>
          </div>

          <div className="lmj-value-card">
            <div className="lmj-value-icon">🔑</div>
            <h3>Bisa Lepas Kunci</h3>
            <p>
              Privasi penuh untuk Anda dan keluarga. Proses verifikasi dokumen
              mudah dan cepat secara online tanpa prosedur birokrasi rumit.
            </p>
          </div>

          <div className="lmj-value-card">
            <div className="lmj-value-icon">🛡️</div>
            <h3>Asuransi &amp; Derek Siaga 24/7</h3>
            <p>
              Setiap mobil dilindungi asuransi All-Risk. Dilengkapi layanan
              bantuan darurat di jalan dan derek towing 24 jam nonstop di
              seluruh rute perjalanan.
            </p>
          </div>
        </div>
      </div>

      {/* ── LOKASI KAMI: SHOWCASE KHUSUS LOKASI MAGELANG ── */}
      <div className="lmj-locations-section">
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <span className="eyebrow">JARINGAN CABANG &amp; POOL</span>
          <h2 className="h1-title" style={{ fontSize: "28px" }}>
            Lokasi Showroom &amp; Kantor Resmi
          </h2>
          <p className="subtitle" style={{ fontSize: "14.5px" }}>
            Kunjungi pool terdekat kami atau nikmati layanan antar-jemput unit
            langsung ke alamat Anda.
          </p>
        </div>

        {/* 🌟 HIGHLIGHT UTAMA: CABANG MAGELANG 🌟 */}
        <div className="lmj-magelang-hero-card">
          <span className="lmj-magelang-badge">
            📍 CABANG &amp; POOL RESMI MAGELANG
          </span>

          <div className="lmj-magelang-grid">
            <div>
              <h3 className="lmj-magelang-title">
                Selaras Rent Car — Kantor &amp; Pool Magelang
              </h3>
              <p className="lmj-magelang-desc">
                Siap melayani kebutuhan rental mobil di wilayah Magelang,
                Borobudur, Mertoyudan, Muntilan, Secang, dan sekitarnya.
                Melayani antar-jemput hotel, stasiun, hingga Bandara YIA
                (Yogyakarta International Airport).
              </p>

              <div className="lmj-magelang-details">
                <div className="lmj-magelang-item">
                  <span>🏢</span>
                  <div>
                    <strong>Alamat Pool:</strong>
                    <div>
                      Jl. Magelang - Yogyakarta KM 7, Mertoyudan, Kab. Magelang,
                      Jawa Tengah 56172 (Strategis dekat Mall Artos &amp; Akmil
                      Magelang)
                    </div>
                  </div>
                </div>

                <div className="lmj-magelang-item">
                  <span>📞</span>
                  <div>
                    <strong>Hotline &amp; Reservasi Magelang:</strong>
                    <div>
                      (0293) 321-8899 / WhatsApp: +62 812-3456-7899 (24 Jam)
                    </div>
                  </div>
                </div>

                <div className="lmj-magelang-item">
                  <span>⏰</span>
                  <div>
                    <strong>Jam Operasional:</strong>
                    <div>Buka 24 Jam Setiap Hari (Senin – Minggu)</div>
                  </div>
                </div>
              </div>

              <div className="lmj-magelang-actions">
                <a
                  href="https://maps.google.com/?q=Mertoyudan+Magelang+Jawa+Tengah"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lmj-btn lmj-btn--gold"
                >
                  Buka Google Maps Magelang ↗
                </a>
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Admin%20Selaras%20Cabang%20Magelang,%20saya%20ingin%20sewa%20mobil"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lmj-btn lmj-btn--outline"
                >
                  WhatsApp Cabang Magelang 💬
                </a>
              </div>
            </div>

            {/* 🗺️ EMBED GOOGLE MAPS LOKASI MAGELANG 🗺️ */}
            <div
              className="lmj-magelang-map-box"
              style={{
                padding: 0,
                overflow: "hidden",
                minHeight: "350px",
                border: "1px solid var(--gold)",
              }}
            >
              <iframe
                title="Lokasi Pool Selaras Magelang"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.518881987588!2d110.2223842!3d-7.5182101!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a8f114c802bc7%3A0x286395b2bc450090!2sMertoyudan%2C%20Magelang%20Regency%2C%20Central%20Java!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "350px", width: "100%" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
