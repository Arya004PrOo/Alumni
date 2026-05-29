import React, { createContext, useContext, useEffect, useState } from "react";
import { verifySession, AuthUser } from "../lib/api";

interface AuthContextType {
  user: AuthUser | null;
  role: string | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthGate provider");
  }
  return context;
};

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const authUrl = import.meta.env.VITE_AUTH_URL || "https://automatic-certify-appointee.ngrok-free.dev";

  const triggerRedirect = () => {
    localStorage.removeItem("token");
    const currentUrl = encodeURIComponent(window.location.href);
    window.location.href = `${authUrl}/login?redirect=${currentUrl}`;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    triggerRedirect();
  };

  const validate = async () => {
    // 1. Grab token from URL parameter if present (SSO return)
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");

    if (tokenFromUrl) {
      console.log("AuthGate: New SSO token detected, storing...");
      localStorage.setItem("token", tokenFromUrl);
      // Clean up URL parameters immediately
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("AuthGate: No token found. Redirecting to SSO...");
      triggerRedirect();
      return;
    }

    try {
      // Validate token against backend /api/v1/auth/me
      const profile = await verifySession();
      setUser(profile);
    } catch (err) {
      console.error("AuthGate: Session verification failed.", err);
      triggerRedirect();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    validate();
    
    // Setup listener for route changes (mount/unmount/history states)
    const handleLocationChange = () => {
      validate();
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  if (loading) {
    return (
      <div style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        fontFamily: "Inter, sans-serif"
      }}>
        <div style={{
          width: 50,
          height: 50,
          border: "4px solid #e2e8f0",
          borderTop: "4px solid #881f42",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: 20
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <h2 style={{ color: "#881f42", fontWeight: 700 }}>Verifying PVG Hub Session...</h2>
        <p style={{ color: "#64748b", marginTop: 8 }}>Finalizing your secure login...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, role: user?.role || null, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
