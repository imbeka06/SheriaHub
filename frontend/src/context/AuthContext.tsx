"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "../lib/api";

type User = {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "LECTURER" | "RESEARCHER" | "ADMIN";
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for saved token on initial load
  useEffect(() => {
    const token = localStorage.getItem("sheriahub_token");
    if (token) {
      api.getMe(token)
        .then((data) => setUser(data.user))
        .catch(() => localStorage.removeItem("sheriahub_token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (data: any) => {
    const res = await api.login(data);
    localStorage.setItem("sheriahub_token", res.token);
    setUser(res.user);
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    localStorage.setItem("sheriahub_token", res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem("sheriahub_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};