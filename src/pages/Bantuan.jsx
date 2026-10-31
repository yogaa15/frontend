export default function Bantuan() {
  return (
    <div>
      <span className="eyebrow">Pusat Bantuan</span>
      <h1 className="h1-title">Ada yang Bisa Kami Bantu?</h1>
      <p className="subtitle" style={{ marginBottom: "32px" }}>
        Tim kami siap membantu lewat kanal berikut:
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
        }}
      >
        {/* Card WhatsApp */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--gold)",
            borderRadius: "12px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div className="badge-icon" style={{ width: "fit-content" }}>
            💬
          </div>
          <div>
            <h3
              style={{ fontFamily: "var(--font-fraunces)", fontSize: "18px" }}
            >
              WhatsApp
            </h3>
            <p
              style={{
                color: "var(--text)",
                fontWeight: "bold",
                margin: "4px 0",
              }}
            >
              +62 812-3456-7890
            </p>
            <p className="subtitle" style={{ fontSize: "12.5px" }}>
              Respon rata-rata di bawah 5 menit
            </p>
          </div>
          <button
            type="button"
            className="btn-gold"
            style={{ marginTop: "auto" }}
          >
            Chat via WhatsApp
          </button>
        </div>

        {/* Card Telepon */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "12px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div className="badge-icon" style={{ width: "fit-content" }}>
            📞
          </div>
          <div>
            <h3
              style={{ fontFamily: "var(--font-fraunces)", fontSize: "18px" }}
            >
              Telepon
            </h3>
            <p
              style={{
                color: "var(--text)",
                fontWeight: "bold",
                margin: "4px 0",
              }}
            >
              (021) 555-0182
            </p>
            <p className="subtitle" style={{ fontSize: "12.5px" }}>
              Setiap hari 07.00–22.00 WIB
            </p>
          </div>
          <button
            type="button"
            style={{
              background: "transparent",
              border: "1px solid var(--line)",
              color: "var(--text)",
              padding: "10px",
              borderRadius: "6px",
              cursor: "pointer",
              marginTop: "auto",
            }}
          >
            Hubungi Sekarang
          </button>
        </div>

        {/* Card Email */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "12px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div className="badge-icon" style={{ width: "fit-content" }}>
            ✉️
          </div>
          <div>
            <h3
              style={{ fontFamily: "var(--font-fraunces)", fontSize: "18px" }}
            >
              Email
            </h3>
            <p
              style={{
                color: "var(--text)",
                fontWeight: "bold",
                margin: "4px 0",
              }}
            >
              bantuan@selaras.id
            </p>
            <p className="subtitle" style={{ fontSize: "12.5px" }}>
              Balasan dalam waktu 1x24 jam
            </p>
          </div>
          <button
            type="button"
            style={{
              background: "transparent",
              border: "1px solid var(--line)",
              color: "var(--text)",
              padding: "10px",
              borderRadius: "6px",
              cursor: "pointer",
              marginTop: "auto",
            }}
          >
            Kirim Email
          </button>
        </div>
      </div>
    </div>
  );
}
