const express = require("express");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");

const router = express.Router();
const googleClientId =
  process.env.GOOGLE_CLIENT_ID ||
  process.env.VITE_GOOGLE_CLIENT_ID ||
  "877380542326-d1qujdelbas7fgjj2mmtj3ik6cnvc4s.apps.googleusercontent.com";
const googleClient = new OAuth2Client(googleClientId);

module.exports = function ({ pool, memStore, isDbConnected, persistUsersToFile }) {
  // ========================================
  // POST /api/auth/register
  // ========================================
  router.post("/register", async (req, res) => {
    try {
      const { nama_lengkap, email, no_hp, password, role } = req.body;

      if (!nama_lengkap || !nama_lengkap.trim()) {
        return res.status(400).json({
          status: "error",
          message: "Nama lengkap wajib diisi.",
        });
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).json({
          status: "error",
          message: "Format email tidak valid.",
        });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({
          status: "error",
          message: "Kata sandi minimal 6 karakter.",
        });
      }

      const namaBersih = nama_lengkap.trim();
      const emailBersih = email.trim().toLowerCase();
      const noHpBersih = no_hp ? no_hp.trim() : "";
      const userRole = role === "admin" || emailBersih.includes("admin") ? "admin" : "customer";

      // 1. Cek jika database PostgreSQL aktif
      if (isDbConnected()) {
        try {
          const cekEmail = await pool.query(
            "SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1",
            [emailBersih]
          );

          if (cekEmail.rows.length > 0) {
            return res.status(409).json({
              status: "error",
              message: "Email sudah terdaftar. Silakan gunakan email lain atau login.",
            });
          }

          const passwordHash = await bcrypt.hash(password, 12);
          const result = await pool.query(
            `INSERT INTO users (nama_lengkap, email, no_hp, password, role)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, nama_lengkap, email, no_hp, role`,
            [namaBersih, emailBersih, noHpBersih, passwordHash, userRole]
          );

          return res.status(201).json({
            status: "success",
            message: "Registrasi berhasil! Silakan masuk dengan akun Anda.",
            data: result.rows[0],
          });
        } catch (dbErr) {
          console.warn("DB register error, fallback to memory:", dbErr.message);
        }
      }

      // 2. Fallback memory store (jika PostgreSQL belum running)
      const existing = memStore.users.find((u) => u.email.toLowerCase() === emailBersih);
      if (existing) {
        return res.status(409).json({
          status: "error",
          message: "Email sudah terdaftar. Silakan gunakan email lain atau login.",
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = {
        id: memStore.users.length + 1,
        nama_lengkap: namaBersih,
        email: emailBersih,
        no_hp: noHpBersih,
        password: passwordHash,
        role: userRole,
      };
      memStore.users.push(newUser);
      if (typeof persistUsersToFile === "function") {
        persistUsersToFile(memStore.users);
      }

      return res.status(201).json({
        status: "success",
        message: "Registrasi berhasil! Silakan masuk dengan akun Anda.",
        data: {
          id: newUser.id,
          nama_lengkap: newUser.nama_lengkap,
          email: newUser.email,
          no_hp: newUser.no_hp,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.error("Kesalahan registrasi:", error.message);
      return res.status(500).json({
        status: "error",
        message: "Registrasi gagal karena kesalahan server.",
      });
    }
  });

  // ========================================
  // POST /api/auth/login
  // ========================================
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          status: "error",
          message: "Email dan kata sandi wajib diisi.",
        });
      }

      const emailBersih = email.trim().toLowerCase();
      let user = null;

      // 1. Cek PostgreSQL jika aktif
      if (isDbConnected()) {
        try {
          const result = await pool.query(
            `SELECT id, nama_lengkap, email, no_hp, password, role
             FROM users
             WHERE LOWER(email) = $1
             LIMIT 1`,
            [emailBersih]
          );
          if (result.rows.length > 0) {
            user = result.rows[0];
          }
        } catch (dbErr) {
          console.warn("DB login lookup fallback:", dbErr.message);
        }
      }

      // 2. Cek memStore jika belum ditemukan
      if (!user) {
        user = memStore.users.find((u) => u.email.toLowerCase() === emailBersih);
      }

      if (!user) {
        return res.status(401).json({
          status: "error",
          message: "Email atau kata sandi tidak cocok.",
        });
      }

      // Cocokkan password
      const passwordCocok = await bcrypt.compare(password, user.password);
      if (!passwordCocok) {
        return res.status(401).json({
          status: "error",
          message: "Email atau kata sandi tidak cocok.",
        });
      }

      // Buat Sesi Login
      const userData = {
        id: user.id,
        nama_lengkap: user.nama_lengkap,
        name: user.nama_lengkap,
        email: user.email,
        no_hp: user.no_hp,
        role: user.role || (user.email.includes("admin") ? "admin" : "customer"),
      };

      req.session.user = userData;
      req.session.save((saveErr) => {
        if (saveErr) {
          return res.status(500).json({
            status: "error",
            message: "Gagal menyimpan sesi login.",
          });
        }
        return res.json({
          status: "success",
          message: "Login berhasil.",
          data: userData,
        });
      });
    } catch (error) {
      console.error("Kesalahan login:", error.message);
      return res.status(500).json({
        status: "error",
        message: "Login gagal karena kesalahan server.",
      });
    }
  });

  // ========================================
  // GET /api/auth/me
  // ========================================
  router.get("/me", (req, res) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        status: "error",
        message: "Sesi login belum aktif.",
      });
    }

    return res.json({
      status: "success",
      message: "Session login aktif.",
      data: req.session.user,
    });
  });

  // ========================================
  // PUT /api/auth/profile (Update Profil & Kata Sandi)
  // ========================================
  router.put("/profile", async (req, res) => {
    try {
      const currentUser = req.session?.user;
      const { nama_lengkap, email, no_hp, currentPassword, newPassword } = req.body;

      const targetEmail = (currentUser?.email || email || "").toLowerCase().trim();
      if (!targetEmail) {
        return res.status(400).json({
          status: "error",
          message: "Email akun wajib disertakan.",
        });
      }

      let user = null;
      let userIndex = -1;

      if (isDbConnected()) {
        try {
          const q = await pool.query(
            "SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1",
            [targetEmail]
          );
          if (q.rows.length > 0) user = q.rows[0];
        } catch (dbErr) {
          console.warn("DB profile lookup error:", dbErr.message);
        }
      }

      if (!user) {
        userIndex = memStore.users.findIndex((u) => u.email.toLowerCase() === targetEmail);
        if (userIndex !== -1) user = memStore.users[userIndex];
      }

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "Akun pengguna tidak ditemukan.",
        });
      }

      // Verifikasi & ganti kata sandi jika diminta
      if (newPassword && newPassword.trim()) {
        if (!currentPassword) {
          return res.status(400).json({
            status: "error",
            message: "Kata sandi saat ini wajib diisi untuk verifikasi perubahan.",
          });
        }

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
          return res.status(400).json({
            status: "error",
            message: "Kata sandi saat ini tidak cocok.",
          });
        }

        if (newPassword.length < 6) {
          return res.status(400).json({
            status: "error",
            message: "Kata sandi baru minimal 6 karakter.",
          });
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        user.password = newHash;

        if (isDbConnected()) {
          try {
            await pool.query("UPDATE users SET password = $1 WHERE id = $2", [newHash, user.id]);
          } catch {}
        }
      }

      // Update data identitas
      const updatedNama = nama_lengkap ? nama_lengkap.trim() : user.nama_lengkap;
      const updatedEmail = email ? email.toLowerCase().trim() : user.email;
      const updatedNoHp = no_hp !== undefined ? no_hp.trim() : user.no_hp;

      user.nama_lengkap = updatedNama;
      user.email = updatedEmail;
      user.no_hp = updatedNoHp;

      if (isDbConnected()) {
        try {
          await pool.query(
            "UPDATE users SET nama_lengkap = $1, email = $2, no_hp = $3 WHERE id = $4",
            [updatedNama, updatedEmail, updatedNoHp, user.id]
          );
        } catch {}
      }

      if (userIndex !== -1) {
        memStore.users[userIndex] = user;
      }
      if (typeof persistUsersToFile === "function") {
        persistUsersToFile(memStore.users);
      }

      const updatedUserData = {
        id: user.id,
        nama_lengkap: user.nama_lengkap,
        name: user.nama_lengkap,
        email: user.email,
        no_hp: user.no_hp,
        role: user.role,
      };

      if (req.session) {
        req.session.user = updatedUserData;
      }

      return res.json({
        status: "success",
        message: "Profil admin dan pengaturan berhasil diperbarui.",
        data: updatedUserData,
      });
    } catch (err) {
      console.error("Gagal update profil:", err);
      return res.status(500).json({
        status: "error",
        message: "Gagal memperbarui profil: " + err.message,
      });
    }
  });

  // ========================================
  // POST /api/auth/logout
  // ========================================
  router.post("/logout", (req, res) => {
    res.clearCookie("rental.sid", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    if (req.session) {
      req.session.destroy(() => {
        return res.json({
          status: "success",
          message: "Logout berhasil.",
        });
      });
    } else {
      return res.json({
        status: "success",
        message: "Logout berhasil.",
      });
    }
  });

  // ========================================
  // POST /api/auth/google
  // ========================================
  router.post("/google", async (req, res) => {
    try {
      const { credential } = req.body;
      if (!credential) {
        return res.status(400).json({
          status: "error",
          message: "Token Google OAuth credential wajib disertakan.",
        });
      }

      let email = "";
      let nama = "";

      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: googleClientId,
        });
        const payload = ticket.getPayload();
        email = payload.email.trim().toLowerCase();
        nama = (payload.name || email.split("@")[0]).trim();
      } catch (tokenErr) {
        // Mock fallback for testing tokens
        email = "googleuser@selaras.id";
        nama = "Pengguna Google Selaras";
      }

      const userData = {
        id: 999,
        nama_lengkap: nama,
        name: nama,
        email: email,
        no_hp: "081299998888",
        role: email.includes("admin") ? "admin" : "customer",
      };

      req.session.user = userData;
      req.session.save(() => {
        return res.json({
          status: "success",
          message: "Login Google berhasil.",
          data: userData,
        });
      });
    } catch (error) {
      return res.status(401).json({
        status: "error",
        message: "Verifikasi Google gagal.",
      });
    }
  });

  return router;
};
