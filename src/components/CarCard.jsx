// src/components/CarCard.jsx
import "./CarCard.css";

export default function CarCard({ mobil }) {
  return (
    <div className="car-card">
      <img src={mobil.img} alt={mobil.nama} className="car-img" />
      <div className="car-info">
        <div>
          <h3 className="car-name">{mobil.nama}</h3>
          <p className="subtitle" style={{ fontSize: "13px" }}>
            {mobil.spek}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p className="car-price">Rp {mobil.harga.toLocaleString()}</p>
          <span className="subtitle" style={{ fontSize: "12px" }}>
            / hari
          </span>
        </div>
      </div>
    </div>
  );
}
