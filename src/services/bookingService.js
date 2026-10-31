// src/services/bookingService.js
// Service untuk mengelola riwayat pemesanan mobil pelanggan (persistent via localStorage)

const STORAGE_KEY = "selaras_orders";

// Data awal riwayat pesanan (kosong secara default jika belum ada transaksi)
const INITIAL_ORDERS = [];

import { orderAPI } from "./api";

/**
 * Mengambil daftar pesanan dari backend API dan memperbarui cache lokal
 */
export async function fetchOrdersFromBackend() {
  try {
    const res = await orderAPI.getAllOrders();
    if (res?.data && Array.isArray(res.data)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
      window.dispatchEvent(new Event("orders_updated"));
      return res.data;
    }
  } catch (err) {
    console.warn("Info: Menggunakan cache pesanan lokal:", err?.message || err);
  }
  return getAllOrders();
}

/**
 * Mendapatkan seluruh daftar pesanan dari localStorage (sinkron instan).
 * Jika belum ada di localStorage, mengembalikan array kosong.
 */
export function getAllOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Gagal membaca riwayat pesanan dari localStorage:", err);
    return [];
  }
}

/**
 * Menyimpan pesanan baru ke localStorage dan sinkronisasi ke backend API.
 * @param {Object} orderData 
 * @returns {Object} order yang tersimpan
 */
export function createOrder(orderData) {
  const currentOrders = getAllOrders();
  const idTrx =
    orderData.id || "TRX-MLG-" + Math.floor(10000000 + Math.random() * 90000000);

  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  const newOrder = {
    ...orderData,
    id: idTrx,
    createdAt: orderData.createdAt || now.toISOString(),
    tgl: orderData.tgl || dateStr,
    status: orderData.status || "lunas",
    pelanggan: orderData.pelanggan || orderData.userName || "Pelanggan Selaras",
    userName: orderData.userName || orderData.pelanggan || "Pelanggan Selaras",
    userEmail: (orderData.userEmail || orderData.email || "").toLowerCase().trim(),
    userId: orderData.userId || orderData.user_id || null,
    telepon: orderData.telepon || "0812-3456-7890",
    av: (orderData.pelanggan || orderData.userName || "PS")
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase(),
    depositJaminan: orderData.depositJaminan || 250000,
    biayaLayanan: orderData.biayaLayanan || 25000,
    totalBayar:
      orderData.totalBayar ||
      (orderData.totalSewa || 0) + (orderData.depositJaminan || 250000) + (orderData.biayaLayanan || 25000),
    total:
      orderData.total ||
      orderData.totalBayar ||
      (orderData.totalSewa || 0) + (orderData.depositJaminan || 250000) + (orderData.biayaLayanan || 25000),
    lokasiAmbil:
      orderData.lokasiAmbil || "Showroom Selaras Mertoyudan Magelang",
    lokasiKembali:
      orderData.lokasiKembali || "Showroom Selaras Mertoyudan Magelang",
    layanan: orderData.layanan || "Lepas Kunci (Self Drive)",
    durasi: orderData.durasi || 3,
    durasiHari: `${orderData.durasi || 3} Hari`,
  };

  const updated = [newOrder, ...currentOrders.filter((o) => o.id !== newOrder.id)];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("orders_updated"));
  } catch (err) {
    console.error("Gagal menyimpan pesanan baru:", err);
  }

  // Kirim ke backend API secara asinkron
  orderAPI.createOrder(newOrder).catch((e) => {
    console.warn("Backend offline saat createOrder, tersimpan lokal:", e?.message);
  });

  return newOrder;
}

/**
 * Memperbarui status pesanan (misal: "Dibatalkan", "lunas", atau "selesai")
 * @param {string} orderId 
 * @param {string} newStatus 
 */
export function updateOrderStatus(orderId, newStatus) {
  const currentOrders = getAllOrders();
  const updated = currentOrders.map((order) => {
    if (order.id === orderId) {
      return { ...order, status: newStatus };
    }
    return order;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("orders_updated"));
  } catch (err) {
    console.error("Gagal memperbarui status pesanan:", err);
  }

  // Kirim ke backend API
  orderAPI.updateOrderStatus(orderId, newStatus).catch((e) => {
    console.warn("Backend offline saat updateOrderStatus, tersimpan lokal:", e?.message);
  });

  return updated;
}

/**
 * Mendapatkan satu pesanan berdasarkan ID
 * @param {string} orderId 
 */
export function getOrderById(orderId) {
  const currentOrders = getAllOrders();
  return currentOrders.find((o) => o.id === orderId) || null;
}
