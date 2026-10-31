// src/services/api.js
// Client API untuk menghubungkan Frontend React ke Backend Rental Mobil (Express + PostgreSQL)
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Wajib true agar session cookie (rental.sid) terkirim secara otomatis
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper untuk menyaring pesan error agar rapi ditampilkan ke antarmuka pengguna
export function getErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message === "Network Error") {
    return "Tidak dapat terhubung ke server backend. Pastikan server backend berjalan di port 3001.";
  }
  if (error.code === "ECONNABORTED") {
    return "Koneksi ke backend mengalami timeout.";
  }
  return error.message || "Terjadi kesalahan pada sistem.";
}

// ==========================================
// 1. SERVICE AUTENTIKASI (AUTH API)
// ==========================================
export const authAPI = {
  /**
   * Registrasi akun pengguna baru
   */
  async register(data) {
    const payload = {
      nama_lengkap: data.nama_lengkap || data.nama,
      email: data.email,
      no_hp: data.no_hp || data.telepon || "",
      password: data.password,
      role: data.role || "customer",
    };
    const response = await apiClient.post("/auth/register", payload);
    return response.data;
  },

  /**
   * Login pengguna menggunakan email & kata sandi
   */
  async login(credentials) {
    const response = await apiClient.post("/auth/login", {
      email: credentials.email,
      password: credentials.password,
    });
    return response.data;
  },

  /**
   * Mengambil data profil sesi pengguna yang sedang login
   */
  async getMe() {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  /**
   * Mengakhiri sesi login pengguna
   */
  async logout() {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },

  /**
   * Login menggunakan Google OAuth
   */
  async loginWithGoogle(credential) {
    const response = await apiClient.post("/auth/google", { credential });
    return response.data;
  },

  /**
   * Memperbarui profil dan kata sandi akun admin / pengguna
   */
  async updateProfile(profileData) {
    const response = await apiClient.put("/auth/profile", profileData);
    return response.data;
  },
};

// ==========================================
// 2. SERVICE ARMADA MOBIL (CARS / PRODUCTS API)
// ==========================================
export const carAPI = {
  /**
   * Mengambil seluruh daftar armada mobil
   */
  async getAllCars() {
    const response = await apiClient.get("/products");
    return response.data;
  },

  /**
   * Mengambil detail armada mobil berdasarkan ID
   */
  async getCarById(id) {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  /**
   * Menambahkan armada mobil baru
   */
  async createCar(carData) {
    const payload = {
      nama: carData.nama,
      spek: carData.spek || `${carData.kategori || "MPV"} • 7 Kursi`,
      harga_harian: Number(carData.harga_harian || carData.harga || 0),
      image_url: carData.image_url || carData.img || "/cars/avanza-veloz.jpg",
      plat: carData.plat || "AA 0000 XX",
      kategori: carData.kategori || "MPV",
      status: carData.status || "tersedia",
    };
    const response = await apiClient.post("/products", payload);
    return response.data;
  },

  /**
   * Memperbarui informasi armada mobil
   */
  async updateCar(id, carData) {
    const payload = {
      nama: carData.nama,
      spek: carData.spek,
      harga_harian: Number(carData.harga_harian || carData.harga || 0),
      image_url: carData.image_url || carData.img,
      plat: carData.plat,
      kategori: carData.kategori,
      status: carData.status,
    };
    const response = await apiClient.put(`/products/${id}`, payload);
    return response.data;
  },

  /**
   * Menghapus armada mobil berdasarkan ID
   */
  async deleteCar(id) {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};

// ==========================================
// 3. SERVICE TRANSAKSI / PEMESANAN (ORDERS API)
// ==========================================
export const orderAPI = {
  /**
   * Mengambil semua daftar transaksi pemesanan
   */
  async getAllOrders() {
    const response = await apiClient.get("/orders");
    return response.data;
  },

  /**
   * Mengambil detail transaksi berdasarkan ID
   */
  async getOrderById(id) {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  /**
   * Membuat transaksi / pesanan sewa baru
   */
  async createOrder(orderData) {
    const response = await apiClient.post("/orders", orderData);
    return response.data;
  },

  /**
   * Memperbarui status transaksi
   */
  async updateOrderStatus(id, statusData) {
    const payload = typeof statusData === "string" ? { status: statusData } : statusData;
    const response = await apiClient.put(`/orders/${id}`, payload);
    return response.data;
  },

  /**
   * Menghapus transaksi
   */
  async deleteOrder(id) {
    const response = await apiClient.delete(`/orders/${id}`);
    return response.data;
  },
};

// ==========================================
// 4. SERVICE KESEHATAN SISTEM (HEALTH API)
// ==========================================
export const healthAPI = {
  async check() {
    const response = await apiClient.get("/health");
    return response.data;
  },
};

// ==========================================
// 5. SERVICE PENGATURAN BISNIS (SETTINGS API)
// ==========================================
export const settingsAPI = {
  async getSettings() {
    const response = await apiClient.get("/settings");
    return response.data;
  },
  async updateSettings(settingsData) {
    const response = await apiClient.put("/settings", settingsData);
    return response.data;
  },
};

export default {
  auth: authAPI,
  cars: carAPI,
  orders: orderAPI,
  health: healthAPI,
  settings: settingsAPI,
};
