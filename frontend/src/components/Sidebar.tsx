import React from "react";

type Props = {
  viewMode?: "dashboard" | "directory" | "companies" | "batches" | "analytics";
  setViewMode?: (mode: "dashboard" | "directory" | "companies" | "batches" | "analytics") => void;
  userRole?: "admin" | "student" | "alumni";
  isCollapsed?: boolean;
  userData?: {
    full_name?: string;
    email?: string;
    username?: string;
    role?: string;
  } | null;
};

export function Sidebar({ 
  viewMode = "dashboard", 
  setViewMode, 
  userRole = "admin",
  isCollapsed = false,
  userData = null
}: Props) {
  const isAdmin = userRole === "admin";

  return (
    <aside className={`erp-sidebar ${isCollapsed ? "erp-sidebar--collapsed" : ""}`}>
      {/* Brand */}
      <div className="erp-sidebar__brand">
        <img 
          src="" 
          alt="College Logo" 
          className="erp-sidebar__logo" 
          data-erp-logo="icon"
          onError={(e) => {
            // Fallback if logo fails to load via erp-theme data attribute
            const displayName = userData?.full_name || (userRole === "admin" ? "Admin" : userRole === "alumni" ? "Alumni" : "Student");
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${displayName}&background=881f42&color=fff`;
          }}
        />
        <div className="erp-sidebar__brand-text">
          <h2 data-erp-college-name="short">College ERP</h2>
          <span>{userRole === "admin" ? "Admin Portal" : userRole === "alumni" ? "Alumni Network" : "Student Hub"}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="erp-sidebar__nav">
        <div className="erp-nav-label">Main</div>
        <a 
          href="#" 
          className={`erp-nav-item ${viewMode === "dashboard" ? "erp-nav-item--active" : ""}`}
          onClick={(e) => { e.preventDefault(); setViewMode?.("dashboard"); }}
        >
          <i className="fas fa-tachometer-alt"></i>
          <span className="erp-nav-item__text">Dashboard</span>
        </a>
        
        {(isAdmin || userRole === "alumni") && (
          <a 
            href="#" 
            className={`erp-nav-item ${viewMode === "directory" ? "erp-nav-item--active" : ""}`}
            onClick={(e) => { e.preventDefault(); setViewMode?.("directory"); }}
          >
            <i className="fas fa-users"></i>
            <span className="erp-nav-item__text">Alumni Directory</span>
          </a>
        )}

        <a 
          href="#" 
          className={`erp-nav-item ${viewMode === "companies" ? "erp-nav-item--active" : ""}`}
          onClick={(e) => { e.preventDefault(); setViewMode?.("companies"); }}
        >
          <i className="fas fa-building"></i>
          <span className="erp-nav-item__text">Companies</span>
        </a>

        <a 
          href="#" 
          className={`erp-nav-item ${viewMode === "batches" ? "erp-nav-item--active" : ""}`}
          onClick={(e) => { e.preventDefault(); setViewMode?.("batches"); }}
        >
          <i className="fas fa-graduation-cap"></i>
          <span className="erp-nav-item__text">Batches</span>
        </a>

        <div className="erp-nav-label">Reports</div>
        <a 
          href="#" 
          className={`erp-nav-item ${viewMode === "analytics" ? "erp-nav-item--active" : ""}`}
          onClick={(e) => { e.preventDefault(); setViewMode?.("analytics"); }}
        >
          <i className="fas fa-chart-bar"></i>
          <span className="erp-nav-item__text">Analytics</span>
        </a>

        {isAdmin && (
          <a 
            href="#" 
            className="erp-nav-item"
            onClick={(e) => { 
              e.preventDefault(); 
              window.open("/alumni/export", "_blank");
            }}
          >
            <i className="fas fa-file-export"></i>
            <span className="erp-nav-item__text">Export Data</span>
          </a>
        )}
      </nav>

      {/* Footer */}
      <div className="erp-sidebar__footer">
        <div className="erp-avatar erp-avatar--sm" style={{ overflow: "hidden", background: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "3px" }}>
          <img data-erp-logo="icon" alt="College" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div className="erp-sidebar__user-info">
          <p>{userData?.full_name || (userRole === "admin" ? "Admin User" : userRole === "alumni" ? "Alumni Member" : "Student User")}</p>
          <span>{userData?.email || (userRole === "admin" ? "Administrator" : userRole === "alumni" ? "Alumni" : "Student")}</span>
        </div>
        <i 
          className="erp-sidebar__logout fas fa-sign-out-alt"
          title="Logout"
          onClick={() => {
            window.location.href = "https://automatic-certify-appointee.ngrok-free.dev/login";
          }}
        ></i>
      </div>
    </aside>
  );
}