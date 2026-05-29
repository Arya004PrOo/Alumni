import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { client } from "../api/client";

export interface User {
  user_id: number | string;
  email: string;
  role: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  role: string | null;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider/AuthGate");
  }
  return context;
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const checkAuth = async () => {
    // 1. Process SSO callback token if present in URL query
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");
    if (tokenFromUrl) {
      console.log("AuthGate: New token detected in URL parameters.");
      localStorage.setItem("token", tokenFromUrl);
      // Immediately clean URL parameters to keep address bar clean
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.log("AuthGate: No token found. Redirecting to login...");
      redirectToLogin();
      return;
    }

    try {
      // 2. Request backend verification endpoint
      const response = await client.get<User>("/api/v1/auth/me");
      setUser(response.data);
      setRole(response.data.role);
      
      // Save user profile state in local storage only as a cached view optimization
      localStorage.setItem("user", JSON.stringify(response.data));
      setIsLoading(false);
    } catch (error: any) {
      console.error("AuthGate: Token verification failed:", error);
      if (error.response?.status === 401) {
        // Axios interceptor will handle the redirection
        return;
      }
      redirectToLogin();
    }
  };

  const redirectToLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    const currentUrl = encodeURIComponent(window.location.href);
    const authUrl = import.meta.env.VITE_AUTH_URL || "https://automatic-certify-appointee.ngrok-free.dev";
    window.location.href = `${authUrl}/login?redirect=${currentUrl}`;
  };

  // Trigger validation on component mount and on each route navigation change
  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div style={{ 
        height: "100vh", width: "100vw", display: "flex", flexDirection: "column", 
        alignItems: "center", justifyContent: "center", background: "#f8fafc", fontFamily: "Inter, sans-serif" 
      }}>
        <div style={{ 
          width: 50, height: 50, border: "4px solid #e2e8f0", borderTop: "4px solid #881f42", 
          borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: 20 
        }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <h2 style={{ color: "#881f42", fontWeight: 700 }}>Verifying PVG Hub Session...</h2>
        <p style={{ color: "#64748b", marginTop: 8 }}>Securing your connection...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, role, isLoading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
