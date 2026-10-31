require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3001;

// ========================================
// FILE PERSISTENCE UNTUK IN-MEMORY STORE
// ========================================
const CARS_STORE_PATH = path.join(__dirname, "data", "cars_store.json");
const ORDERS_STORE_PATH = path.join(__dirname, "data", "orders_store.json");
const USERS_STORE_PATH = path.join(__dirname, "data", "users_store.json");
const SETTINGS_STORE_PATH = path.join(__dirname, "data", "settings_store.json");

const defaultSettings = {
  businessName: "Selaras Rental Mobil Magelang",
  businessContact: "(0293) 321-8899",
  businessAddress: "Jl. Magelang - Yogyakarta KM 7, Mertoyudan, Magelang",
  businessHours: "24 Jam / 7 Hari",
  adminPhone: "0812-3344-5566",
};

function loadPersistedSettings() {
  try {
    if (fs.existsSync(SETTINGS_STORE_PATH)) {
      const content = fs.readFileSync(SETTINGS_STORE_PATH, "utf-8").trim();
      if (content) return JSON.parse(content);
    }
  } catch (err) {
    console.warn("Info persistensi settings:", err.message);
  }
  return defaultSettings;
}

function persistSettingsToFile(settings) {
  try {
    const dir = path.dirname(SETTINGS_STORE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_STORE_PATH, JSON.stringify(settings, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal simpan settings_store.json:", err.message);
  }
}

function loadPersistedCars() {
  try {
    if (fs.existsSync(CARS_STORE_PATH)) {
      const content = fs.readFileSync(CARS_STORE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`✔ Memuat ${parsed.length} armada mobil dari data persisten (cars_store.json).`);
        return parsed;
      }
    }
  } catch (err) {
    console.warn("ℹ Info persistensi cars_store.json:", err.message);
  }
  return null;
}

function persistCarsToFile(carsList) {
  try {
    const dir = path.dirname(CARS_STORE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CARS_STORE_PATH, JSON.stringify(carsList, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal menyimpan cars_store.json:", err.message);
  }
}

function loadPersistedOrders() {
  try {
    if (fs.existsSync(ORDERS_STORE_PATH)) {
      const content = fs.readFileSync(ORDERS_STORE_PATH, "utf-8").trim();
      if (!content) return [];
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        console.log(`✔ Memuat ${parsed.length} data transaksi (orders_store.json).`);
        return parsed;
      }
    }
  } catch (err) {
    console.warn("ℹ Info persistensi orders_store.json:", err.message);
  }
  return null;
}

function persistOrdersToFile(ordersList) {
  try {
    const dir = path.dirname(ORDERS_STORE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ORDERS_STORE_PATH, JSON.stringify(ordersList, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal menyimpan orders_store.json:", err.message);
  }
}

function loadPersistedUsers() {
  try {
    if (fs.existsSync(USERS_STORE_PATH)) {
      const content = fs.readFileSync(USERS_STORE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`✔ Memuat ${parsed.length} akun pengguna (users_store.json).`);
        return parsed;
      }
    }
  } catch (err) {
    console.warn("ℹ Info persistensi users_store.json:", err.message);
  }
  return null;
}

function persistUsersToFile(usersList) {
  try {
    const dir = path.dirname(USERS_STORE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USERS_STORE_PATH, JSON.stringify(usersList, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal menyimpan users_store.json:", err.message);
  }
}

function normalizeCar(c) {
  const h = Number(
    c.harga_harian !== undefined && c.harga_harian !== null
      ? c.harga_harian
      : c.harga || 0
  );
  const imgUrl = c.image_url || c.img || "/cars/avanza-veloz.jpg";
  let statusRaw = (c.status || "tersedia").toLowerCase();
  if (statusRaw === "available") statusRaw = "tersedia";
  if (statusRaw === "unavailable") statusRaw = "disewa";

  const isTersedia = statusRaw === "tersedia";
  const tot = c.totalUnit || 8;
  const tersedia = c.unitTersedia !== undefined ? c.unitTersedia : isTersedia ? 6 : 0;
  const tidakTersedia = c.unitTidakTersedia !== undefined ? c.unitTidakTersedia : isTersedia ? 2 : tot;

  return {
    ...c,
    harga: h,
    harga_harian: h,
    img: imgUrl,
    image_url: imgUrl,
    plat: c.plat || `AA ${c.id || 1} MLG`,
    kategori: c.kategori || "MPV",
    transmisi: c.transmisi || (c.spek && c.spek.toLowerCase().includes("matic") ? "Matic" : "Manual"),
    kursi: c.kursi || 7,
    bbm: c.bbm || (c.spek && c.spek.toLowerCase().includes("diesel") ? "Diesel" : "Bensin"),
    spek: c.spek || `${c.kategori || "MPV"} • 7 Kursi`,
    rating: c.rating || 4.9,
    status: statusRaw,
    totalUnit: tot,
    unitTersedia: tersedia,
    unitTidakTersedia: tidakTersedia,
  };
}

// ========================================
// KONEKSI DATABASE POSTGRESQL & FALLBACK STORE
// ========================================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

let dbConnected = false;

// In-Memory Store untuk menjamin backend tetap 100% berfungsi saat PostgreSQL belum dinyalakan
const memStore = {
  users: [
    {
      id: 1,
      nama_lengkap: "Administrator Selaras",
      email: "admin@selaras.id",
      no_hp: "081234567890",
      password: bcrypt.hashSync("admin12345", 10),
      role: "admin",
    },
  ],
  cars: [
    {
      id: 1,
      nama: "Toyota Avanza Veloz 1.5",
      kategori: "MPV",
      transmisi: "Manual",
      kursi: 7,
      bbm: "Bensin",
      spek: "MPV Keluarga Terfavorit • Manual • 7 Kursi",
      harga_harian: 350000,
      harga: 350000,
      rating: 4.9,
      totalUnit: 8,
      unitTersedia: 6,
      unitTidakTersedia: 2,
      plat: "AA 1204 GA",
      image_url: "/cars/avanza-veloz.jpg",
      img: "/cars/avanza-veloz.jpg",
      deskripsi: "Paling laris di Magelang untuk keliling kota, wisata Candi Borobudur, dan perjalanan keluarga.",
      status: "tersedia",
    },
    {
      id: 2,
      nama: "Toyota Kijang Innova Reborn Diesel",
      kategori: "MPV",
      transmisi: "Manual",
      kursi: 7,
      bbm: "Diesel",
      spek: "MPV Primadona Magelang • Manual • 7 Kursi",
      harga_harian: 500000,
      harga: 500000,
      rating: 5.0,
      totalUnit: 8,
      unitTersedia: 6,
      unitTidakTersedia: 2,
      plat: "AA 8817 ZA",
      image_url: "/cars/innova-reborn.jpg",
      img: "/cars/innova-reborn.jpg",
      deskripsi: "Sangat bertenaga untuk rute perbukitan Menoreh, Ketep Pass, Telomoyo, dan wisata Dieng.",
      status: "tersedia",
    },
    {
      id: 3,
      nama: "Honda Brio RS",
      kategori: "Hatchback",
      transmisi: "Matic",
      kursi: 5,
      bbm: "Bensin",
      spek: "City Car Lincah & Irit • Matic • 5 Kursi",
      harga_harian: 275000,
      harga: 275000,
      rating: 4.8,
      totalUnit: 7,
      unitTersedia: 5,
      unitTidakTersedia: 2,
      plat: "AA 7719 BRO",
      image_url: "/cars/honda-brio.jpg",
      img: "/cars/honda-brio.jpg",
      deskripsi: "Pilihan favorit anak muda dan wisatawan santai untuk kulineran di Kota Magelang.",
      status: "tersedia",
    },
    {
      id: 4,
      nama: "Toyota Hiace Commuter 15-Seat",
      kategori: "Minibus",
      transmisi: "Manual",
      kursi: 15,
      bbm: "Diesel",
      spek: "Minibus Wisata Rombongan • Manual • 15 Kursi",
      harga_harian: 1100000,
      harga: 1100000,
      rating: 4.9,
      totalUnit: 5,
      unitTersedia: 3,
      unitTidakTersedia: 2,
      plat: "AA 7012 HC",
      image_url: "/cars/hiace-commuter.jpg",
      img: "/cars/hiace-commuter.jpg",
      deskripsi: "Armada utama rombongan wisata Borobudur, rafting Sungai Elo/Progo, dan ziarah Jawa Tengah.",
      status: "tersedia",
    },
    {
      id: 5,
      nama: "Toyota Innova Zenix Hybrid",
      kategori: "MPV",
      transmisi: "Matic",
      kursi: 7,
      bbm: "Hybrid",
      spek: "MPV Mewah Ramah Lingkungan • Matic • 7 Kursi",
      harga_harian: 750000,
      harga: 750000,
      rating: 4.9,
      totalUnit: 5,
      unitTersedia: 4,
      unitTidakTersedia: 1,
      plat: "AA 2109 ZN",
      image_url: "/cars/innova-zenix.jpg",
      img: "/cars/innova-zenix.jpg",
      deskripsi: "Kabin senyap dan mewah untuk perjalanan dinas VIP dan tamu hotel/resort di Magelang.",
      status: "tersedia",
    },
    {
      id: 6,
      nama: "Daihatsu All New Xenia",
      kategori: "MPV",
      transmisi: "Manual",
      kursi: 7,
      bbm: "Bensin",
      spek: "MPV Keluarga Hemat • Manual • 7 Kursi",
      harga_harian: 300000,
      harga: 300000,
      rating: 4.7,
      totalUnit: 6,
      unitTersedia: 4,
      unitTidakTersedia: 2,
      plat: "AA 1845 AB",
      image_url: "/cars/daihatsu-xenia.jpg",
      img: "/cars/daihatsu-xenia.jpg",
      deskripsi: "Tarif sewa ekonomis dengan kenyamanan optimal untuk perjalanan dalam dan luar kota.",
      status: "tersedia",
    },
    {
      id: 7,
      nama: "Mitsubishi Pajero Sport Dakar",
      kategori: "SUV",
      transmisi: "Matic",
      kursi: 7,
      bbm: "Diesel",
      spek: "SUV Tangguh Segala Medan • Matic • 7 Kursi",
      harga_harian: 900000,
      harga: 900000,
      rating: 4.9,
      totalUnit: 5,
      unitTersedia: 3,
      unitTidakTersedia: 2,
      plat: "AA 4402 KM",
      image_url: "/cars/pajero-sport.jpg",
      img: "/cars/pajero-sport.jpg",
      deskripsi: "Gagah dan siap menjelajah tanjakan lereng Gunung Merapi, Merbabu, dan Sumbing.",
      status: "tersedia",
    },
    {
      id: 8,
      nama: "Toyota Fortuner 2.8 GR Sport",
      kategori: "SUV",
      transmisi: "Matic",
      kursi: 7,
      bbm: "Diesel",
      spek: "SUV Eksekutif Berwibawa • Matic • 7 Kursi",
      harga_harian: 950000,
      harga: 950000,
      rating: 4.9,
      totalUnit: 4,
      unitTersedia: 2,
      unitTidakTersedia: 2,
      plat: "AA 9021 FTR",
      image_url: "/cars/toyota-fortuner.jpg",
      img: "/cars/toyota-fortuner.jpg",
      deskripsi: "Pilihan tepat untuk acara kedinasan, kunjungan militer di Akmil Magelang, dan tamu penting.",
      status: "tersedia",
    },
    {
      id: 9,
      nama: "Toyota Calya 1.2 G",
      kategori: "MPV",
      transmisi: "Manual",
      kursi: 7,
      bbm: "Bensin",
      spek: "Mobil Rental Paling Hemat • Manual • 7 Kursi",
      harga_harian: 250000,
      harga: 250000,
      rating: 4.7,
      totalUnit: 6,
      unitTersedia: 5,
      unitTidakTersedia: 1,
      plat: "AA 1530 CL",
      image_url: "/cars/toyota-calya.jpg",
      img: "/cars/toyota-calya.jpg",
      deskripsi: "Sangat hemat bahan bakar untuk kebutuhan harian di Magelang dan sekitarnya.",
      status: "tersedia",
    },
    {
      id: 10,
      nama: "Honda HR-V 1.5 SE",
      kategori: "SUV",
      transmisi: "Matic",
      kursi: 5,
      bbm: "Bensin",
      spek: "Compact Crossover Modern • Matic • 5 Kursi",
      harga_harian: 500000,
      harga: 500000,
      rating: 4.8,
      totalUnit: 4,
      unitTersedia: 3,
      unitTidakTersedia: 1,
      plat: "AA 3321 HRV",
      image_url: "/cars/honda-hrv.jpg",
      img: "/cars/honda-hrv.jpg",
      deskripsi: "Tampil keren dan elegan untuk jalan santai di pusat kota Magelang atau ke Yogyakarta.",
      status: "tersedia",
    },
    {
      id: 11,
      nama: "Toyota Alphard Transformer",
      kategori: "MPV",
      transmisi: "Matic",
      kursi: 7,
      bbm: "Bensin",
      spek: "VIP Luxury Executive • Matic • 7 Kursi",
      harga_harian: 1850000,
      harga: 1850000,
      rating: 5.0,
      totalUnit: 3,
      unitTersedia: 1,
      unitTidakTersedia: 2,
      plat: "AA 2291 ALP",
      image_url: "/cars/toyota-alphard.jpg",
      img: "/cars/toyota-alphard.jpg",
      deskripsi: "Standar VIP pernikahan megah di Magelang serta antar-jemput tamu resort mewah Borobudur.",
      status: "tersedia",
    },
    {
      id: 12,
      nama: "Hyundai Ioniq 5 Electric (EV)",
      kategori: "Mobil Listrik",
      transmisi: "Matic",
      kursi: 5,
      bbm: "Listrik",
      spek: "Mobil Listrik Wisata Hijau • Matic • 5 Kursi",
      harga_harian: 950000,
      harga: 950000,
      rating: 4.9,
      totalUnit: 3,
      unitTersedia: 2,
      unitTidakTersedia: 1,
      plat: "AA 1024 EV",
      image_url: "/cars/hyundai-ioniq5.jpg",
      img: "/cars/hyundai-ioniq5.jpg",
      deskripsi: "Teknologi modern tanpa emisi untuk keliling kawasan cagar budaya Borobudur yang hijau.",
      status: "tersedia",
    },
  ],
  orders: [
    {
      id: "TRX-MLG-84920193",
      createdAt: "2026-09-28T10:15:00.000Z",
      tgl: "28 Sep 2026",
      pelanggan: "Raka Pradana",
      userName: "Raka Pradana",
      userEmail: "raka.pradana@gmail.com",
      telepon: "0812-3456-7890",
      av: "RP",
      mobil: {
        id: 2,
        nama: "Toyota Kijang Innova Reborn Diesel",
        kategori: "MPV",
        transmisi: "Manual",
        kursi: 7,
        bbm: "Diesel",
        spek: "MPV Primadona Magelang • Manual • 7 Kursi",
        harga: 500000,
        img: "/cars/innova-reborn.jpg",
        plat: "AA 8817 ZA",
      },
      namaMobil: "Toyota Kijang Innova Reborn Diesel",
      plat: "AA 8817 ZA",
      tglAmbil: "2026-09-28T09:00",
      tglKembali: "2026-10-01T09:00",
      durasi: 3,
      durasiHari: "3 Hari",
      totalSewa: 1500000,
      depositJaminan: 250000,
      biayaLayanan: 25000,
      totalBayar: 1775000,
      total: 1775000,
      metodePembayaran: "BCA Virtual Account",
      status: "lunas",
      layanan: "Lepas Kunci (Self Drive)",
      lokasiAmbil: "Showroom Selaras Mertoyudan Magelang",
      lokasiKembali: "Showroom Selaras Mertoyudan Magelang",
    },
    {
      id: "TRX-MLG-71930290",
      createdAt: "2026-09-27T14:30:00.000Z",
      tgl: "27 Sep 2026",
      pelanggan: "Sinta Nuraini",
      userName: "Sinta Nuraini",
      userEmail: "sinta.nur@yahoo.com",
      telepon: "0813-9876-5432",
      av: "SN",
      mobil: {
        id: 1,
        nama: "Toyota Avanza Veloz 1.5",
        kategori: "MPV",
        transmisi: "Manual",
        kursi: 7,
        bbm: "Bensin",
        spek: "MPV Keluarga Terfavorit • Manual • 7 Kursi",
        harga: 350000,
        img: "/cars/avanza-veloz.jpg",
        plat: "AA 1204 GA",
      },
      namaMobil: "Toyota Avanza Veloz 1.5",
      plat: "AA 1204 GA",
      tglAmbil: "2026-09-27T08:00",
      tglKembali: "2026-09-29T08:00",
      durasi: 2,
      durasiHari: "2 Hari",
      totalSewa: 700000,
      depositJaminan: 200000,
      biayaLayanan: 25000,
      totalBayar: 925000,
      total: 925000,
      metodePembayaran: "Mandiri Transfer",
      status: "pending",
      layanan: "Include Driver Wisata Borobudur",
      lokasiAmbil: "Hotel Grand Artos Magelang",
      lokasiKembali: "Showroom Selaras Mertoyudan Magelang",
    },
    {
      id: "TRX-MLG-65291048",
      createdAt: "2026-09-26T09:00:00.000Z",
      tgl: "26 Sep 2026",
      pelanggan: "Budi Wicaksono",
      userName: "Budi Wicaksono",
      userEmail: "budi.w@gmail.com",
      telepon: "0878-1122-3344",
      av: "BW",
      mobil: {
        id: 4,
        nama: "Toyota Hiace Commuter 15-Seat",
        kategori: "Minibus",
        transmisi: "Manual",
        kursi: 15,
        bbm: "Diesel",
        spek: "Minibus Wisata Rombongan • Manual • 15 Kursi",
        harga: 1100000,
        img: "/cars/hiace-commuter.jpg",
        plat: "AA 7012 HC",
      },
      namaMobil: "Toyota Hiace Commuter 15-Seat",
      plat: "AA 7012 HC",
      tglAmbil: "2026-09-26T07:00",
      tglKembali: "2026-09-27T07:00",
      durasi: 1,
      durasiHari: "1 Hari",
      totalSewa: 1100000,
      depositJaminan: 250000,
      biayaLayanan: 25000,
      totalBayar: 1375000,
      total: 1375000,
      metodePembayaran: "QRIS Instant",
      status: "lunas",
      layanan: "Rombongan Wisata Rafting Elo",
      lokasiAmbil: "Alun-Alun Kota Magelang",
      lokasiKembali: "Alun-Alun Kota Magelang",
    },
    {
      id: "TRX-MLG-58102934",
      createdAt: "2026-09-25T11:20:00.000Z",
      tgl: "25 Sep 2026",
      pelanggan: "Dewi Anggraini",
      userName: "Dewi Anggraini",
      userEmail: "dewi.ang@gmail.com",
      telepon: "0856-7788-9900",
      av: "DA",
      mobil: {
        id: 3,
        nama: "Honda Brio RS",
        kategori: "Hatchback",
        transmisi: "Matic",
        kursi: 5,
        bbm: "Bensin",
        spek: "City Car Lincah & Irit • Matic • 5 Kursi",
        harga: 275000,
        img: "/cars/honda-brio.jpg",
        plat: "AA 7719 BRO",
      },
      namaMobil: "Honda Brio RS",
      plat: "AA 7719 BRO",
      tglAmbil: "2026-09-25T10:00",
      tglKembali: "2026-09-28T10:00",
      durasi: 3,
      durasiHari: "3 Hari",
      totalSewa: 825000,
      depositJaminan: 200000,
      biayaLayanan: 25000,
      totalBayar: 1050000,
      total: 1050000,
      metodePembayaran: "GoPay / QRIS",
      status: "selesai",
      layanan: "Lepas Kunci (Self Drive)",
      lokasiAmbil: "Showroom Selaras Mertoyudan",
      lokasiKembali: "Showroom Selaras Mertoyudan",
    },
    {
      id: "TRX-MLG-49201928",
      createdAt: "2026-09-24T15:00:00.000Z",
      tgl: "24 Sep 2026",
      pelanggan: "Fajar Hidayat",
      userName: "Fajar Hidayat",
      userEmail: "fajar.h@outlook.com",
      telepon: "0819-2233-4455",
      av: "FH",
      mobil: {
        id: 7,
        nama: "Mitsubishi Pajero Sport Dakar",
        kategori: "SUV",
        transmisi: "Matic",
        kursi: 7,
        bbm: "Diesel",
        spek: "SUV Tangguh Segala Medan • Matic • 7 Kursi",
        harga: 900000,
        img: "/cars/pajero-sport.jpg",
        plat: "AA 4402 KM",
      },
      namaMobil: "Mitsubishi Pajero Sport Dakar",
      plat: "AA 4402 KM",
      tglAmbil: "2026-09-24T09:00",
      tglKembali: "2026-09-26T09:00",
      durasi: 2,
      durasiHari: "2 Hari",
      totalSewa: 1800000,
      depositJaminan: 250000,
      biayaLayanan: 25000,
      totalBayar: 2075000,
      total: 2075000,
      metodePembayaran: "BNI Virtual Account",
      status: "pending",
      layanan: "Wisata Lereng Merapi & Telomoyo",
      lokasiAmbil: "Showroom Selaras Mertoyudan",
      lokasiKembali: "Showroom Selaras Mertoyudan",
    },
  ],
};

// Inisialisasi data mobil dari file jika ada perubahan sebelumnya
const savedCars = loadPersistedCars();
if (savedCars && savedCars.length > 0) {
  memStore.cars = savedCars.map(normalizeCar);
} else {
  memStore.cars = memStore.cars.map(normalizeCar);
  persistCarsToFile(memStore.cars);
}

// Inisialisasi data transaksi dari file jika ada
const savedOrders = loadPersistedOrders();
if (savedOrders !== null) {
  memStore.orders = savedOrders;
} else {
  persistOrdersToFile(memStore.orders);
}

// Inisialisasi data pengguna dari file jika ada
const savedUsers = loadPersistedUsers();
if (savedUsers && savedUsers.length > 0) {
  memStore.users = savedUsers;
} else {
  persistUsersToFile(memStore.users);
}

// Cek koneksi ke PostgreSQL di awal
pool
  .query("SELECT NOW()")
  .then(() => {
    dbConnected = true;
    console.log("✔ PostgreSQL terhubung dengan sukses.");
  })
  .catch((err) => {
    dbConnected = false;
    console.log(
      "ℹ PostgreSQL offline (menggunakan in-memory store aktif untuk development & testing)."
    );
  });

function isDbConnected() {
  return dbConnected;
}

// ========================================
// MIDDLEWARE CORS (Frontend Vite Support)
// ========================================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// MIDDLEWARE SESSION
// ========================================
const SESSION_SECRET =
  process.env.SESSION_SECRET || "rental_mobil_super_secret_key_2026";

app.use(
  session({
    name: "rental.sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 24 jam
    },
  })
);

// ========================================
// ROUTE AUTENTIKASI
// ========================================
app.use("/api/auth", authRoutes({ pool, memStore, isDbConnected, persistUsersToFile }));

// ========================================
// ENDPOINT HEALTH CHECK
// ========================================
app.get("/api/health", async (req, res) => {
  let dbStatus = "Offline (In-Memory Active)";
  let waktuDb = new Date().toISOString();

  if (dbConnected) {
    try {
      const q = await pool.query("SELECT NOW() as now");
      dbStatus = "PostgreSQL Connected";
      waktuDb = q.rows[0].now;
    } catch {
      dbStatus = "PostgreSQL Disconnected";
    }
  }

  res.json({
    status: "success",
    server: "Express.js Running",
    port: PORT,
    database: dbStatus,
    waktu_server: waktuDb,
    session: req.session?.user ? "Logged In (" + req.session.user.email + ")" : "Guest",
  });
});

// ========================================
// ROUTE CRUD MOBIL / PRODUCTS
// ========================================
// 1. GET Semua Mobil
const getCarsHandler = async (req, res) => {
  if (dbConnected) {
    try {
      const result = await pool.query("SELECT * FROM cars ORDER BY id ASC");
      if (result.rows.length > 0) {
        return res.json({
          status: "success",
          total: result.rows.length,
          data: result.rows.map(normalizeCar),
        });
      }
    } catch (err) {
      console.warn("DB cars fetch fallback to memory:", err.message);
    }
  }

  return res.json({
    status: "success",
    total: memStore.cars.length,
    data: memStore.cars.map(normalizeCar),
  });
};

app.get("/api/products", getCarsHandler);
app.get("/api/cars", getCarsHandler);

// 2. GET Detail Mobil
const getCarByIdHandler = async (req, res) => {
  const id = Number(req.params.id);

  if (dbConnected) {
    try {
      const result = await pool.query("SELECT * FROM cars WHERE id = $1", [id]);
      if (result.rows.length > 0) {
        return res.json({ status: "success", data: normalizeCar(result.rows[0]) });
      }
    } catch (err) {
      console.warn("DB car detail fallback:", err.message);
    }
  }

  const car = memStore.cars.find((c) => Number(c.id) === Number(id));
  if (!car) {
    return res.status(404).json({ status: "error", message: "Mobil tidak ditemukan." });
  }

  return res.json({ status: "success", data: normalizeCar(car) });
};

app.get("/api/products/:id", getCarByIdHandler);
app.get("/api/cars/:id", getCarByIdHandler);

// 3. POST Tambah Mobil
const createCarHandler = async (req, res) => {
  const { nama, spek, harga_harian, harga, image_url, img, plat, kategori, status } = req.body;
  const nominalHarga = Number(harga_harian !== undefined && harga_harian !== null ? harga_harian : (harga || 0));

  if (!nama || !nominalHarga) {
    return res.status(400).json({
      status: "error",
      message: "Nama mobil dan harga harian wajib diisi.",
    });
  }

  const carPlat = plat ? plat.trim().toUpperCase() : `AA ${memStore.cars.length + 1} MLG`;
  const carImg = (image_url || img || "/cars/avanza-veloz.jpg").trim();
  const carKategori = kategori || "MPV";
  const carStatus = (status || "tersedia").toLowerCase();

  if (dbConnected) {
    try {
      const result = await pool.query(
        `INSERT INTO cars (nama, spek, harga_harian, image_url, plat, kategori, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          nama.trim(),
          spek ? spek.trim() : `${carKategori} • 7 Kursi`,
          nominalHarga,
          carImg,
          carPlat,
          carKategori,
          carStatus,
        ]
      );
      return res.status(201).json({
        status: "success",
        message: "Armada mobil berhasil ditambahkan ke database.",
        data: normalizeCar(result.rows[0]),
      });
    } catch (err) {
      console.warn("DB insert car fallback to memory:", err.message);
    }
  }

  const maxId = memStore.cars.length > 0 ? Math.max(...memStore.cars.map((c) => Number(c.id) || 0)) : 0;
  const newCar = normalizeCar({
    id: maxId + 1,
    nama: nama.trim(),
    spek: spek ? spek.trim() : `${carKategori} • 7 Kursi`,
    harga_harian: nominalHarga,
    harga: nominalHarga,
    image_url: carImg,
    img: carImg,
    plat: carPlat,
    kategori: carKategori,
    status: carStatus,
    totalUnit: req.body.totalUnit || 8,
    unitTersedia: req.body.unitTersedia !== undefined ? req.body.unitTersedia : (carStatus === "tersedia" ? 6 : 0),
    unitTidakTersedia: req.body.unitTidakTersedia !== undefined ? req.body.unitTidakTersedia : (carStatus === "tersedia" ? 2 : 8),
  });

  memStore.cars.unshift(newCar);
  persistCarsToFile(memStore.cars);
  return res.status(201).json({
    status: "success",
    message: "Armada mobil berhasil ditambahkan.",
    data: newCar,
  });
};

app.post("/api/products", createCarHandler);
app.post("/api/cars", createCarHandler);

// 4. PUT Update Mobil
const updateCarHandler = async (req, res) => {
  const id = Number(req.params.id);
  const { nama, spek, harga_harian, harga, image_url, img, plat, kategori, status } = req.body;

  if (dbConnected) {
    try {
      const result = await pool.query(
        `UPDATE cars
         SET nama = COALESCE($1, nama),
             spek = COALESCE($2, spek),
             harga_harian = COALESCE($3, harga_harian),
             image_url = COALESCE($4, image_url),
             plat = COALESCE($5, plat),
             kategori = COALESCE($6, kategori),
             status = COALESCE($7, status),
             updated_at = NOW()
         WHERE id = $8
         RETURNING *`,
        [
          nama,
          spek,
          harga_harian !== undefined ? Number(harga_harian) : (harga !== undefined ? Number(harga) : null),
          image_url || img,
          plat,
          kategori,
          status,
          id,
        ]
      );
      if (result.rows.length > 0) {
        return res.json({
          status: "success",
          message: "Data armada berhasil diperbarui di database.",
          data: normalizeCar(result.rows[0]),
        });
      }
    } catch (err) {
      console.warn("DB update car fallback:", err.message);
    }
  }

  const idx = memStore.cars.findIndex((c) => Number(c.id) === Number(id));
  if (idx === -1) {
    return res.status(404).json({ status: "error", message: "Mobil tidak ditemukan." });
  }

  const newStatus = status ? status.toLowerCase() : memStore.cars[idx].status;
  const isTersedia = newStatus === "tersedia" || newStatus === "available";
  const newPrice = harga_harian !== undefined && harga_harian !== null && harga_harian !== ""
    ? Number(harga_harian)
    : harga !== undefined && harga !== null && harga !== ""
      ? Number(harga)
      : memStore.cars[idx].harga_harian;

  const currentTotal = memStore.cars[idx].totalUnit || 8;

  memStore.cars[idx] = normalizeCar({
    ...memStore.cars[idx],
    ...(nama && { nama: nama.trim() }),
    ...(spek && { spek: spek.trim() }),
    harga_harian: newPrice,
    harga: newPrice,
    ...(image_url && { image_url: image_url.trim(), img: image_url.trim() }),
    ...(img && { image_url: img.trim(), img: img.trim() }),
    ...(plat && { plat: plat.trim().toUpperCase() }),
    ...(kategori && { kategori }),
    status: newStatus,
    unitTersedia: isTersedia ? (memStore.cars[idx].unitTersedia || 6) : 0,
    unitTidakTersedia: isTersedia ? (memStore.cars[idx].unitTidakTersedia || 2) : currentTotal,
  });

  persistCarsToFile(memStore.cars);

  return res.json({
    status: "success",
    message: "Data armada berhasil diperbarui.",
    data: memStore.cars[idx],
  });
};

app.put("/api/products/:id", updateCarHandler);
app.put("/api/cars/:id", updateCarHandler);

// 5. DELETE Hapus Mobil
const deleteCarHandler = async (req, res) => {
  const id = Number(req.params.id);

  if (dbConnected) {
    try {
      const result = await pool.query("DELETE FROM cars WHERE id = $1 RETURNING id, nama", [id]);
      if (result.rows.length > 0) {
        return res.json({
          status: "success",
          message: `Mobil ${result.rows[0].nama} berhasil dihapus.`,
        });
      }
    } catch (err) {
      console.warn("DB delete fallback:", err.message);
    }
  }

  const idx = memStore.cars.findIndex((c) => Number(c.id) === Number(id));
  if (idx === -1) {
    return res.status(404).json({ status: "error", message: "Mobil tidak ditemukan." });
  }

  const deleted = memStore.cars.splice(idx, 1);
  persistCarsToFile(memStore.cars);
  return res.json({
    status: "success",
    message: `Mobil ${deleted[0].nama} berhasil dihapus.`,
  });
};

app.delete("/api/products/:id", deleteCarHandler);
app.delete("/api/cars/:id", deleteCarHandler);

// ========================================
// ROUTE TRANSAKSI & PEMESANAN (ORDERS / BOOKINGS)
// ========================================
// 1. GET Semua Transaksi
const getOrdersHandler = async (req, res) => {
  const persisted = loadPersistedOrders();
  if (persisted !== null) {
    memStore.orders = persisted;
  }

  const queryEmail = (req.query.email || "").toLowerCase().trim();
  const queryUserId = req.query.userId || req.query.user_id;

  let result = memStore.orders;
  if (queryEmail) {
    result = result.filter((o) => {
      const oEmail = (o.userEmail || o.email || "").toLowerCase().trim();
      return oEmail === queryEmail;
    });
  } else if (queryUserId) {
    result = result.filter((o) => String(o.userId || o.user_id) === String(queryUserId));
  }

  return res.json({
    status: "success",
    total: result.length,
    data: result,
  });
};
app.get("/api/orders", getOrdersHandler);
app.get("/api/bookings", getOrdersHandler);
app.delete("/api/orders", (req, res) => {
  memStore.orders = [];
  persistOrdersToFile([]);
  return res.json({ status: "success", message: "Semua data transaksi berhasil dikosongkan." });
});

// ========================================
// ROUTE PENGATURAN BISNIS (SETTINGS)
// ========================================
app.get("/api/settings", (req, res) => {
  const settings = loadPersistedSettings();
  return res.json({
    status: "success",
    data: settings,
  });
});

app.put("/api/settings", (req, res) => {
  const current = loadPersistedSettings();
  const updated = {
    ...current,
    ...req.body,
  };
  persistSettingsToFile(updated);
  return res.json({
    status: "success",
    message: "Pengaturan bisnis berhasil diperbarui.",
    data: updated,
  });
});

// 2. GET Detail Transaksi
const getOrderByIdHandler = async (req, res) => {
  const id = req.params.id;
  const order = memStore.orders.find((o) => String(o.id) === String(id));
  if (!order) {
    return res.status(404).json({ status: "error", message: "Transaksi tidak ditemukan." });
  }
  return res.json({ status: "success", data: order });
};
app.get("/api/orders/:id", getOrderByIdHandler);
app.get("/api/bookings/:id", getOrderByIdHandler);

// 3. POST Tambah Transaksi / Pemesanan Baru
const createOrderHandler = async (req, res) => {
  const orderData = req.body;
  if (!orderData || (!orderData.mobil && !orderData.namaMobil)) {
    return res.status(400).json({
      status: "error",
      message: "Data pemesanan dan armada mobil wajib diisi.",
    });
  }

  const idTrx = orderData.id || "TRX-MLG-" + Math.floor(10000000 + Math.random() * 90000000);
  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  const newOrder = {
    ...orderData,
    id: idTrx,
    createdAt: orderData.createdAt || now.toISOString(),
    tgl: orderData.tgl || dateStr,
    status: (orderData.status || "lunas").toLowerCase(),
    userId: orderData.userId || orderData.user_id || req.session?.user?.id || null,
    pelanggan: orderData.pelanggan || orderData.userName || req.session?.user?.nama_lengkap || "Pelanggan Selaras",
    userName: orderData.userName || orderData.pelanggan || req.session?.user?.nama_lengkap || "Pelanggan Selaras",
    userEmail: orderData.userEmail || orderData.email || req.session?.user?.email || "",
    telepon: orderData.telepon || req.session?.user?.no_hp || "0812-3456-7890",
    av: (orderData.pelanggan || orderData.userName || "PS")
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase(),
    namaMobil: orderData.mobil?.nama || orderData.namaMobil || "Armada Selaras",
    plat: orderData.mobil?.plat || orderData.plat || "AA 8817 ZA",
    total: Number(orderData.total || orderData.totalBayar || 0),
    totalBayar: Number(orderData.totalBayar || orderData.total || 0),
    durasi: Number(orderData.durasi || 1),
    durasiHari: `${orderData.durasi || 1} Hari`,
  };

  memStore.orders.unshift(newOrder);
  persistOrdersToFile(memStore.orders);

  return res.status(201).json({
    status: "success",
    message: "Pemesanan berhasil disimpan ke database.",
    data: newOrder,
  });
};
app.post("/api/orders", createOrderHandler);
app.post("/api/bookings", createOrderHandler);

// 4. PUT Update Status Transaksi
const updateOrderHandler = async (req, res) => {
  const id = req.params.id;
  const idx = memStore.orders.findIndex((o) => String(o.id) === String(id));
  if (idx === -1) {
    return res.status(404).json({ status: "error", message: "Transaksi tidak ditemukan." });
  }

  const updatedStatus = (req.body.status || memStore.orders[idx].status).toLowerCase();
  memStore.orders[idx] = {
    ...memStore.orders[idx],
    ...req.body,
    status: updatedStatus,
  };
  persistOrdersToFile(memStore.orders);

  return res.json({
    status: "success",
    message: "Status transaksi berhasil diperbarui.",
    data: memStore.orders[idx],
  });
};
app.put("/api/orders/:id", updateOrderHandler);
app.put("/api/orders/:id/status", updateOrderHandler);
app.put("/api/bookings/:id", updateOrderHandler);
app.put("/api/bookings/:id/status", updateOrderHandler);

// 5. DELETE Hapus Transaksi
const deleteOrderHandler = async (req, res) => {
  const id = req.params.id;
  const idx = memStore.orders.findIndex((o) => String(o.id) === String(id));
  if (idx === -1) {
    return res.status(404).json({ status: "error", message: "Transaksi tidak ditemukan." });
  }
  const deleted = memStore.orders.splice(idx, 1);
  persistOrdersToFile(memStore.orders);
  return res.json({
    status: "success",
    message: `Transaksi ${id} berhasil dihapus.`,
  });
};
app.delete("/api/orders/:id", deleteOrderHandler);
app.delete("/api/bookings/:id", deleteOrderHandler);

// ========================================
// ROOT ENDPOINT
// ========================================
app.get("/", (req, res) => {
  res.json({
    status: "success",
    app: "Selaras Rental Mobil Backend API",
    version: "1.0.0",
    health: "http://localhost:" + PORT + "/api/health",
    endpoints: {
      auth: "/api/auth (register, login, me, logout, google)",
      cars: "/api/products (GET, POST, PUT, DELETE)",
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Endpoint tidak ditemukan." });
});

// START SERVER
const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  SELARAS RENTAL MOBIL - UNIFIED BACKEND API  `);
  console.log(`===============================================`);
  console.log(`  Server Port    : http://localhost:${PORT}`);
  console.log(`  Health Check   : http://localhost:${PORT}/api/health`);
  console.log(`  CORS Diizinkan : http://localhost:5173`);
  console.log(`===============================================`);
});

process.on("SIGINT", () => server.close());
process.on("SIGTERM", () => server.close());
