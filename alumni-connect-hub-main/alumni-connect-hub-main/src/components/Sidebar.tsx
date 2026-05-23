import React from "react";

export function Sidebar() {
  return (
    <aside className="erp-sidebar">
      {/* Brand */}
      <div className="erp-sidebar__brand">
        <div
          className="erp-sidebar__logo"
          style={{
            background: "var(--erp-primary)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          C
        </div>
        <div className="erp-sidebar__brand-text">
          <h2>College ERP</h2>
          <span>Alumni Hub</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="erp-sidebar__nav">
        <div className="erp-nav-label">Main</div>
        <a href="/" className="erp-nav-item erp-nav-item--active">
          <i className="fas fa-tachometer-alt"></i>
          <span className="erp-nav-item__text">Dashboard</span>
        </a>
        <a href="#" className="erp-nav-item">
          <i className="fas fa-users"></i>
          <span className="erp-nav-item__text">Alumni</span>
        </a>
        <a href="#" className="erp-nav-item">
          <i className="fas fa-building"></i>
          <span className="erp-nav-item__text">Companies</span>
        </a>
        <a href="#" className="erp-nav-item">
          <i className="fas fa-graduation-cap"></i>
          <span className="erp-nav-item__text">Batches</span>
        </a>

        <div className="erp-nav-label">Reports</div>
        <a href="#" className="erp-nav-item">
          <i className="fas fa-chart-bar"></i>
          <span className="erp-nav-item__text">Analytics</span>
        </a>
        <a href="#" className="erp-nav-item">
          <i className="fas fa-file-export"></i>
          <span className="erp-nav-item__text">Export Data</span>
        </a>
      </nav>

      {/* Footer */}
      <div className="erp-sidebar__footer">
        <div
          className="erp-avatar"
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--erp-primary-light)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          A
        </div>
        <div className="erp-sidebar__user-info">
          <p>Admin User</p>
          <span>Administrator</span>
        </div>
        <i className="erp-sidebar__logout fas fa-sign-out-alt"></i>
      </div>
    </aside>
  );
}