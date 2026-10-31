import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("selaras_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sinkronisasi status autentikasi dari session cookie backend
  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      try {
        const res = await authAPI.getMe();
        if (isMounted && res?.data) {
          const syncedUser = {
            ...res.data,
            name: res.data.nama_lengkap || res.data.name || "Pengguna Selaras",
            role: res.data.role || (res.data.email?.toLowerCase().includes("admin") ? "admin" : "customer"),
          };
          setUser(syncedUser);
          localStorage.setItem("selaras_user", JSON.stringify(syncedUser));
        }
      } catch {
        // Abaikan jika belum login di server
      }
    }
    checkSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = (userData) => {
    const data = {
      ...userData,
      name: userData.nama_lengkap || userData.name || (userData.email?.toLowerCase().includes("admin") ? "Administrator Selaras" : "Pelanggan Selaras"),
      role: userData.role || (userData.email?.toLowerCase().includes("admin") ? "admin" : "customer"),
      token: userData.token || "session-token-" + Date.now(),
    };
    setUser(data);
    localStorage.setItem("selaras_user", JSON.stringify(data));
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.warn("Logout backend:", err?.message);
    }
    setUser(null);
    localStorage.removeItem("selaras_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === "admin",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
