import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { authApi } from "@/lib/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "manager" | "cashier";
  is_active?: boolean;
  last_login?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("shop_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("shop_token")
  );
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  // Verify token on mount — but don't redirect on failure during initial load
  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await authApi.me();
        if (res.success && res.data) {
          setUser(res.data);
          localStorage.setItem("shop_user", JSON.stringify(res.data));
        }
      } catch {
        // Token invalid or backend unreachable — keep local state for offline
        // Don't logout here so the app works when backend is down
      } finally {
        setIsLoading(false);
      }
    };
    verify();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    if (res.success && res.data) {
      const { user: userData, token: tokenData } = res.data;
      setUser(userData);
      setToken(tokenData);
      localStorage.setItem("shop_token", tokenData);
      localStorage.setItem("shop_user", JSON.stringify(userData));
      localStorage.setItem("shop_authenticated", "true");
    } else {
      throw new Error(res.message || "Login failed.");
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("shop_token");
    localStorage.removeItem("shop_user");
    localStorage.removeItem("shop_authenticated");
    localStorage.removeItem("active_shop_id");
  }, []);

  const hasRole = useCallback(
    (...roles: string[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem("shop_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout, hasRole, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
