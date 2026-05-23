export function Navbar() {
  return (
    <header className="erp-topbar" style={{ left: 0 }}>
      <div className="erp-topbar__profile">
        <div className="erp-avatar erp-avatar--md">A</div>
        <div className="erp-profile-info">
          <p>Alumni Dashboard</p>
          <span>College ERP · Placement Module</span>
        </div>
      </div>

      <div className="erp-topbar__actions">
        <button className="erp-topbar__btn" aria-label="Notifications">
          <i className="fas fa-bell"></i>
          <span className="erp-dot"></span>
        </button>

        <button className="erp-topbar__btn" aria-label="Settings">
          <i className="fas fa-cog"></i>
        </button>

        <button className="erp-topbar__btn" aria-label="Profile">
          <div className="erp-avatar erp-avatar--sm">U</div>
        </button>
      </div>
    </header>
  );
}
