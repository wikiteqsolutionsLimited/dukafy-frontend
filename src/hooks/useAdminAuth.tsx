import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/adminApi";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("dukafy_admin_token");
    if (token) {
      adminApi.me()
        .then((res) => setUser(res.data))
        .catch(() => { localStorage.removeItem("dukafy_admin_token"); })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await adminApi.login(email, password);
    localStorage.setItem("dukafy_admin_token", res.data.token);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("dukafy_admin_token");
    setUser(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
