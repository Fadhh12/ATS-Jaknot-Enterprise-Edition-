"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearToken, getMe, getToken, login as apiLogin, type CurrentUser } from "@/lib/api";

type AuthState = {
  user: CurrentUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isDemoMode: boolean;
};

const AuthContext = createContext<AuthState | null>(null);

const PUBLIC_PATHS = new Set(["/login"]);

// Demo user for preview
const DEMO_USER: CurrentUser = {
  id: "demo-id",
  name: "Nabil (Demo)",
  email: "nabilbiel12@gmail.com",
  role: "recruiting_administrator",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    // Always allow access in demo mode (no backend needed)
    setIsDemoMode(true);
    setUser(DEMO_USER);
    setLoading(false);
    return;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_PATHS.has(pathname);
    if (!user && !isPublic) router.replace("/login");
    if (user && isPublic) router.replace("/");
  }, [loading, user, pathname, router]);

  const login = useCallback(
    async (email: string, password: string) => {
      await apiLogin(email, password);
      await refresh();
      router.replace("/");
    },
    [refresh, router]
  );

  const logout = useCallback(() => {
    // In demo mode, just reload the page
    window.location.reload();
  }, []);

  return <AuthContext.Provider value={{ user, loading, login, logout, isDemoMode }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
