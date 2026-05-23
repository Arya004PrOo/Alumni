import { useEffect, useState } from "react";

type Props = {
  onToggleSidebar?: () => void;
  userRole?: "admin" | "student" | "alumni";
};

export function Navbar({ onToggleSidebar, userRole = "admin" }: Props) {
  const isAdmin = userRole === "admin";
  const isAlumni = userRole === "alumni";

  return (
    <header className="erp-topbar">
      {/* Sidebar Toggle */}
      <button 
        className="erp-topbar__btn" 
        onClick={onToggleSidebar}
        title="Toggle Sidebar"
        style={{ marginRight: "12px" }}
      >
        <i className="fas fa-bars"></i>
      </button>

      {/* Breadcrumb */}
      <div className="erp-topbar__breadcrumb">
        <span>ERP</span>
        <i className="fas fa-chevron-right"></i>
        <span className="current">
          {isAdmin ? "Admin Portal" : isAlumni ? "Alumni Network" : "Student Hub"}
        </span>
      </div>

      {/* Search */}
      <div className="erp-topbar__search">
        <i className="fas fa-search"></i>
        <input type="text" placeholder="Search alumni, companies..." />
      </div>

      {/* Actions */}
      <div className="erp-topbar__actions">
        <div className="erp-topbar__profile">
          <div className="erp-avatar erp-avatar--md" style={{ overflow: "hidden", background: "#fff", border: "1px solid var(--erp-border)", padding: "4px" }}>
            <img data-erp-logo="icon" alt="College" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div className="erp-profile-info">
            <p>{isAdmin ? "Alumni Connect" : isAlumni ? "Alumni Portal" : "Student Hub"}</p>
            <span data-erp-college-name="short">College ERP</span>
          </div>
          <i className="fas fa-chevron-down"></i>
        </div>
      </div>
    </header>
  );
}
