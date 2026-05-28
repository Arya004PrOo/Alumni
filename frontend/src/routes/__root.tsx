import { Outlet, Link, createRootRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import appCss from "../styles.css?url";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PVG Alumni Hub" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      // 1. Grab tokens from URL
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get("token");
      const roleFromUrl = params.get("role");
      const userIdFromUrl = params.get("user_id");

      if (tokenFromUrl) {
        console.log("SSO: Token detected, starting profile sync...");
        
        // 2. Clear old data to ensure fresh sync
        localStorage.removeItem("user");

        // 3. Save initial bits immediately
        localStorage.setItem("token", tokenFromUrl);
        if (roleFromUrl) localStorage.setItem("role", roleFromUrl);
        if (userIdFromUrl) localStorage.setItem("user_id", userIdFromUrl);

        try {
          // 4. Fetch FULL Profile from Auth Backend
          const response = await fetch("https://automatic-certify-appointee.ngrok-free.dev/api/users/me", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${tokenFromUrl}`,
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "69420"
            }
          });

          if (response.ok) {
            const fullUserData = await response.json();
            
            // 5. STORE THE FULL JSON OBJECT AS REQUESTED
            localStorage.setItem("user", JSON.stringify(fullUserData));
            
            // Also ensure role and user_id are synced from the full profile
            if (fullUserData.role) localStorage.setItem("role", fullUserData.role);
            if (fullUserData.id) localStorage.setItem("user_id", fullUserData.id.toString());
            
            console.log("SSO SUCCESS: Full user data stored in localStorage.user", fullUserData);
            
            // 6. Instant URL Cleanup
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            console.error("SSO ERROR: Auth backend rejected token (Status:", response.status, ")");
          }
        } catch (error) {
          console.error("SSO ERROR: Could not reach Auth Backend server.", error);
        }
      }
      
      // Allow app to render after 500ms to ensure localStorage writes are finished
      setTimeout(() => setIsVerifying(false), 500);
    };

    initializeUser();
  }, []);

  if (isVerifying) {
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
        <p style={{ color: "#64748b", marginTop: 8 }}>Finalizing your secure login...</p>
      </div>
    );
  }

  return (
    <>
      <Outlet />
      <Toaster position="bottom-right" richColors />
    </>
  );
}
