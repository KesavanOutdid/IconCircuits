"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiCall } from "@/lib/api-client";

interface User {
  id: string;
  userId: number;
  name: string;
  email: string;
  roleId: number;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedAuth = localStorage.getItem("isAuthenticated");
        const storedUser = localStorage.getItem("user");

        if (storedAuth === "true" && storedUser) {
          setIsAuthenticated(true);
          setUser(JSON.parse(storedUser));
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(initializeAuth, 0);
    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string) => {
    interface LoginResponse {
      token: string;
      user: User;
    }

    const response = await apiCall<LoginResponse>("/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setIsAuthenticated(true);
    setUser(response.user);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user", JSON.stringify(response.user));
    localStorage.setItem("authToken", response.token);
  };

  const logout = async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
