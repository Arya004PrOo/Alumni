import { useCallback, useEffect, useState, useMemo } from "react";
import { Navbar } from "./Navbar";
import { AlumniTable } from "./AlumniTable";
import { AddAlumniForm } from "./AddAlumniForm";
import { InviteAlumniCard } from "./InviteAlumniCard";
import { BroadcastNotificationCard } from "./BroadcastNotificationCard";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { Sidebar } from "./Sidebar";
import { fetchAllAlumni, fetchAlumniCount, verifyToken, setAuthToken } from "../lib/api";
import { useSidebar } from "../hooks/useSidebar";
import { toast } from "sonner";
import { useAuth } from "../auth/AuthGate";

// define Alumni type locally to avoid import/type errors
type Alumni = {
  id: number;
  full_name: string;
  email: string;
  company?: string;
  company_type?: string;
  designation?: string;
  linkedin_url?: string;
  graduation_year: number;
  skills?: string;
};

export function Dashboard() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"dashboard" | "directory" | "companies" | "batches" | "analytics">("dashboard");
  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedCompanyType, setSelectedCompanyType] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const [batchFilter, setBatchFilter] = useState("");
  const { user, role, isLoading } = useAuth();
  const userRole = (role as "admin" | "student" | "alumni") || "admin";
  const userData = user;
  const authLoaded = !isLoading;
  const { isCollapsed, toggle: toggleSidebar } = useSidebar();

  useEffect(() => {
    if (role === "student" && viewMode === "directory") {
      setViewMode("dashboard");
    }
  }, [viewMode, role]);

  useEffect(() => {
    // Trigger ERP Theme injections once React has rendered the components
    if (typeof window !== "undefined" && (window as any).ERP) {
      const erp = (window as any).ERP;
      erp.College?.init();
    }
  }, []);

  // Reset sub-views when switching main view mode
  useEffect(() => {
    if (viewMode !== "companies") setSelectedCompanyType(null);
    if (viewMode !== "batches") setSelectedBatch(null);
  }, [viewMode]);

  const loadAlumni = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllAlumni();
      setAlumni(data);
    } catch (err: any) {
      setError("Failed to load alumni");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCount = useCallback(async () => {
    try {
      const data = await fetchAlumniCount();
      setCount(data);
    } catch {
      setCount(null);
    }
  }, []);

  useEffect(() => {
    if (authLoaded) {
      loadAlumni();
      loadCount();
    }
  }, [authLoaded, loadAlumni, loadCount]);

  const handleSuccess = () => {
    loadAlumni();
    loadCount();
  };

  const uniqueCompanies = new Set(
    alumni.map((a) => a.company).filter(Boolean)
  ).size;

  const latestYear =
    alumni.length > 0
      ? Math.max(...alumni.map((a) => a.graduation_year))
      : 0;

  const companyTypesMap = useMemo(() => {
    const map = new Map<string, {
      companyCount: number,
      alumniCount: number,
      companies: Map<string, { alumniCount: number, latestYear: number, topRoles: Record<string, number> }>
    }>();

    alumni.forEach(a => {
      const type = a.company_type || "General / Others";
      const company = a.company || "Unknown Organization";

      if (!map.has(type)) {
        map.set(type, { companyCount: 0, alumniCount: 0, companies: new Map() });
      }

      const typeData = map.get(type)!;
      typeData.alumniCount += 1;

      if (!typeData.companies.has(company)) {
        typeData.companies.set(company, { alumniCount: 0, latestYear: 0, topRoles: {} });
        typeData.companyCount += 1;
      }

      const compData = typeData.companies.get(company)!;
      compData.alumniCount += 1;
      if (a.graduation_year > compData.latestYear) compData.latestYear = a.graduation_year;
      if (a.designation) {
        const role = a.designation.trim();
        compData.topRoles[role] = (compData.topRoles[role] || 0) + 1;
      }
    });

    return Array.from(map.entries()).sort((a, b) => b[1].alumniCount - a[1].alumniCount);
  }, [alumni]);

  const batchesMap = useMemo(() => {
    const map = new Map<number, { 
      count: number, 
      topCompanies: Record<string, number>, 
      topCategories: Record<string, number>,
      topRoles: Record<string, number>
    }>();

    alumni.forEach(a => {
      if (a.graduation_year) {
        const year = a.graduation_year;
        if (!map.has(year)) {
          map.set(year, { count: 0, topCompanies: {}, topCategories: {}, topRoles: {} });
        }
        const data = map.get(year)!;
        data.count += 1;
        if (a.company) {
          const comp = a.company.trim();
          data.topCompanies[comp] = (data.topCompanies[comp] || 0) + 1;
        }
        if (a.company_type) {
          const cat = a.company_type.trim();
          data.topCategories[cat] = (data.topCategories[cat] || 0) + 1;
        }
        if (a.designation) {
          const role = a.designation.trim();
          data.topRoles[role] = (data.topRoles[role] || 0) + 1;
        }
      }
    });
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [alumni]);

  const topStats = useMemo(() => {
    if (alumni.length === 0) return { company: "-", category: "-", batch: "-" };

    const compCounts: Record<string, number> = {};
    const catCounts: Record<string, number> = {};
    const batchCounts: Record<string, number> = {};

    alumni.forEach(a => {
      if (a.company) compCounts[a.company] = (compCounts[a.company] || 0) + 1;
      if (a.company_type) catCounts[a.company_type] = (catCounts[a.company_type] || 0) + 1;
      if (a.graduation_year) batchCounts[a.graduation_year] = (batchCounts[a.graduation_year] || 0) + 1;
    });

    const getTop = (counts: Record<string, number>) =>
      Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

    return {
      company: getTop(compCounts),
      category: getTop(catCounts),
      batch: getTop(batchCounts)
    };
  }, [alumni]);

  const totalSkills = useMemo(() => {
    const skills = new Set<string>();
    alumni.forEach(a => {
      if (a.skills) {
        a.skills.split(",").forEach(s => {
          const trimmed = s.trim();
          if (trimmed) skills.add(trimmed);
        });
      }
    });
    return skills.size;
  }, [alumni]);

  return (
    <div className="erp-app">
      <Sidebar 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
        userRole={userRole}
        isCollapsed={isCollapsed}
        userData={userData}
      />
      
      <Navbar 
        onToggleSidebar={toggleSidebar} 
        userRole={userRole} 
      />

      <main className="erp-main">
        <div className="erp-page-container">
          <div
            className="erp-animate-in"
            style={{
              position: "relative",
              padding: "52px",
              borderRadius: "32px",
              marginBottom: "44px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "linear-gradient(135deg, #881f42 0%, #6b1634 50%, #a92755 100%)",
              boxShadow: "0 25px 50px -12px rgba(136, 31, 66, 0.4)",
              overflow: "hidden"
            }}
          >
            {/* Decorative Glows */}
            <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "240px", height: "240px", background: "rgba(255,255,255,0.1)", borderRadius: "50%", filter: "blur(70px)" }}></div>
            <div style={{ position: "absolute", bottom: "-40px", left: "10%", width: "180px", height: "180px", background: "rgba(253,185,10,0.2)", borderRadius: "50%", filter: "blur(50px)" }}></div>
            


            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <span style={{ padding: "6px 14px", background: "rgba(255,255,255,0.15)", borderRadius: "100px", color: "#fff", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  {viewMode === "dashboard" ? "Admin Intelligence" : "Alumni Network"}
                </span>
              </div>
              <h1 style={{ fontSize: "48px", fontWeight: 900, color: "#fff", letterSpacing: "-2px", lineHeight: 1, textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                {viewMode === "dashboard" ? "Alumni Hub" : "Directory"} <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 400 }}>Insights</span>
              </h1>
              <p style={{ fontSize: "17px", marginTop: "16px", color: "rgba(255,255,255,0.85)", maxWidth: "520px", fontWeight: 400, lineHeight: 1.6 }}>
                {viewMode === "dashboard"
                  ? "Welcome back. Manage your global network, track graduate success, and drive engagement from a single, powerful command center."
                  : "Bridge the gap between generations. Search, filter, and connect with thousands of distinguished alumni across the world."}
              </p>
            </div>

            {/* Wordmark Logo - Shifted to absolute right corner */}
            <img 
              data-erp-logo="wordmark" 
              alt="College Wordmark" 
              style={{ 
                position: "absolute", 
                top: "32px", 
                right: "48px", 
                height: "45px", 
                opacity: 1
              }} 
            />

            {userRole === "admin" && (
              <div style={{ position: "relative", zIndex: 2 }}>
                <button
                  className="erp-btn erp-btn--warning erp-card-hover"
                  onClick={() => setViewMode(viewMode === "dashboard" ? "directory" : "dashboard")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "18px",
                    padding: "26px 56px",
                    background: "#fff",
                    color: "#1e3a8a",
                    borderRadius: "28px",
                    fontWeight: 900,
                    fontSize: "19px",
                    boxShadow: "0 25px 50px -10px rgba(0,0,0,0.35)",
                    border: "none",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "pointer"
                  }}
                >
                  <i className={`fas ${viewMode === "dashboard" ? "fa-address-book" : "fa-chart-pie"}`} style={{ fontSize: "28px" }}></i>
                  {viewMode === "dashboard" ? "Explore Network" : "Dashboard Overview"}
                </button>
              </div>
            )}
          </div>

          {viewMode === "dashboard" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32, marginBottom: 48 }}>
              {/* Card 1: Total Alumni */}
              <div className="erp-stat-card erp-card-hover" style={{ background: "linear-gradient(135deg, #881f42 0%, #6b1634 100%)", color: "#fff", border: "1px solid rgba(253, 185, 10, 0.2)" }}>
                <div className="erp-stat-card__header">
                  <div className="erp-stat-card__icon" style={{ background: "rgba(253, 185, 10, 0.15)", color: "#fdb90a" }}>
                    <i className="fas fa-user-graduate"></i>
                  </div>
                  <div className="erp-stat-card__trend" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: "11px" }}>
                    <i className="fas fa-arrow-up" style={{ color: "#fdb90a", marginRight: 4 }}></i> 12%
                  </div>
                </div>
                <div className="erp-stat-card__value" style={{ color: "#fff", fontSize: "32px", fontWeight: 800 }}>{count ?? alumni.length}</div>
                <div className="erp-stat-card__label" style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Total Alumni</div>
              </div>

              {/* Card 2: Partner Companies */}
              <div className="erp-stat-card erp-card-hover" style={{ background: "linear-gradient(135deg, #881f42 0%, #6b1634 100%)", color: "#fff", border: "1px solid rgba(253, 185, 10, 0.2)" }}>
                <div className="erp-stat-card__header">
                  <div className="erp-stat-card__icon" style={{ background: "rgba(253, 185, 10, 0.15)", color: "#fdb90a" }}>
                    <i className="fas fa-building"></i>
                  </div>
                </div>
                <div className="erp-stat-card__value" style={{ color: "#fff", fontSize: "32px", fontWeight: 800 }}>{uniqueCompanies}</div>
                <div className="erp-stat-card__label" style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Partner Companies</div>
              </div>

              {/* Card 3: Latest Batch */}
              <div className="erp-stat-card erp-card-hover" style={{ background: "linear-gradient(135deg, #881f42 0%, #6b1634 100%)", color: "#fff", border: "1px solid rgba(253, 185, 10, 0.2)" }}>
                <div className="erp-stat-card__header">
                  <div className="erp-stat-card__icon" style={{ background: "rgba(253, 185, 10, 0.15)", color: "#fdb90a" }}>
                    <i className="fas fa-graduation-cap"></i>
                  </div>
                </div>
                <div className="erp-stat-card__value" style={{ color: "#fff", fontSize: "32px", fontWeight: 800 }}>{latestYear || "-"}</div>
                <div className="erp-stat-card__label" style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Latest Batch</div>
              </div>

              {/* Card 4: Top Employer */}
              <div className="erp-stat-card erp-card-hover" style={{ background: "linear-gradient(135deg, #881f42 0%, #6b1634 100%)", color: "#fff", border: "1px solid rgba(253, 185, 10, 0.2)" }}>
                <div className="erp-stat-card__header">
                  <div className="erp-stat-card__icon" style={{ background: "rgba(253, 185, 10, 0.15)", color: "#fdb90a" }}>
                    <i className="fas fa-award"></i>
                  </div>
                </div>
                <div className="erp-stat-card__value" style={{ color: "#fff", fontSize: "24px", fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{topStats.company}</div>
                <div className="erp-stat-card__label" style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Top Employer</div>
              </div>

              {/* Card 5: Leading Industry */}
              <div className="erp-stat-card erp-card-hover" style={{ background: "linear-gradient(135deg, #881f42 0%, #6b1634 100%)", color: "#fff", border: "1px solid rgba(253, 185, 10, 0.2)" }}>
                <div className="erp-stat-card__header">
                  <div className="erp-stat-card__icon" style={{ background: "rgba(253, 185, 10, 0.15)", color: "#fdb90a" }}>
                    <i className="fas fa-microchip"></i>
                  </div>
                </div>
                <div className="erp-stat-card__value" style={{ color: "#fff", fontSize: "24px", fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{topStats.category}</div>
                <div className="erp-stat-card__label" style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Leading Industry</div>
              </div>

              {/* Card 6: Network Expertise */}
              <div className="erp-stat-card erp-card-hover" style={{ background: "linear-gradient(135deg, #881f42 0%, #6b1634 100%)", color: "#fff", border: "1px solid rgba(253, 185, 10, 0.2)" }}>
                <div className="erp-stat-card__header">
                  <div className="erp-stat-card__icon" style={{ background: "rgba(253, 185, 10, 0.15)", color: "#fdb90a" }}>
                    <i className="fas fa-lightbulb"></i>
                  </div>
                </div>
                <div className="erp-stat-card__value" style={{ color: "#fff", fontSize: "32px", fontWeight: 800 }}>{totalSkills}</div>
                <div className="erp-stat-card__label" style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Network Expertise</div>
              </div>
            </div>
          )}

          {viewMode === "dashboard" && authLoaded && (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              <AnalyticsCharts alumni={alumni} />
              {userRole === "admin" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 28 }}>
                    <AddAlumniForm onSuccess={handleSuccess} />
                    <InviteAlumniCard />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 28 }}>
                    <BroadcastNotificationCard />
                  </div>
                </div>
              )}
            </div>
          )}

          {viewMode === "directory" && (
            <div>
              <AlumniTable
                alumni={alumni}
                loading={loading}
                error={error}
                userRole={userRole}
                onDeleteSuccess={handleSuccess}
                initialSearchQuery={globalSearch}
                initialYearFilter={batchFilter}
                onSearchChange={setGlobalSearch}
                onYearFilterChange={setBatchFilter}
              />
            </div>
          )}

          {viewMode === "analytics" && authLoaded && (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }} className="erp-animate-in">
              <div style={{ marginBottom: 10 }}>
                <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--erp-dark)" }}>Analytics & Reporting</h2>
                <p style={{ color: "var(--erp-text-muted)", marginTop: "6px" }}>Deep dive into placement metrics, company distributions, and batch statistics.</p>
              </div>
              <AnalyticsCharts alumni={alumni} />
            </div>
          )}

          {viewMode === "companies" && (
            <div className="erp-animate-in">
              {!selectedCompanyType ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                    <div>
                      <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--erp-dark)" }}>Industry Categories</h2>
                      <p style={{ color: "var(--erp-text-muted)", marginTop: "6px" }}>Discover companies grouped by their industry and specialization.</p>
                    </div>
                    {userRole === "admin" && (
                      <button className="erp-btn erp-btn--primary" onClick={() => setViewMode("directory")}>
                        <i className="fas fa-users" style={{ marginRight: 8 }}></i> Browse All Alumni
                      </button>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "32px" }}>
                    {companyTypesMap.map(([type, data]) => (
                      <div key={type} className="erp-glass erp-card-hover" style={{ padding: "32px", borderRadius: "24px", display: "flex", flexDirection: "column", gap: "20px", borderTop: "5px solid var(--erp-primary)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, var(--erp-primary), var(--erp-primary-light))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 8px 16px rgba(26, 86, 219, 0.2)" }}>
                            <i className={
                              type.toLowerCase().includes("tech") ? "fas fa-laptop-code" :
                                type.toLowerCase().includes("commercial") ? "fas fa-chart-line" :
                                  type.toLowerCase().includes("ai") ? "fas fa-brain" :
                                    type.toLowerCase().includes("product") ? "fas fa-box-open" :
                                      type.toLowerCase().includes("industrial") ? "fas fa-industry" :
                                        "fas fa-building"
                            }></i>
                          </div>
                          <div>
                            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--erp-dark)", letterSpacing: "-0.5px" }}>{type}</h3>
                            <span style={{ fontSize: "13px", color: "var(--erp-text-muted)", fontWeight: 600 }}>{data.companyCount} Companies</span>
                          </div>
                        </div>

                        <div style={{ background: "rgba(0,0,0,0.03)", padding: "16px", borderRadius: "12px", fontSize: "14px", color: "var(--erp-text-muted)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Total Alumni:</span>
                            <span style={{ fontWeight: 700, color: "var(--erp-dark)" }}>{data.alumniCount}</span>
                          </div>
                        </div>

                        <button className="erp-btn erp-btn--primary" onClick={() => setSelectedCompanyType(type)} style={{ width: "100%", padding: "12px", borderRadius: "12px", fontWeight: 700, marginTop: "8px" }}>
                          View Companies <i className="fas fa-chevron-right" style={{ marginLeft: 8, fontSize: 12 }}></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                      <button
                        className="erp-btn"
                        onClick={() => setSelectedCompanyType(null)}
                        style={{ width: 44, height: 44, padding: 0, borderRadius: "50%", background: "#fff", boxShadow: "var(--erp-shadow-sm)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--erp-dark)" }}
                      >
                        <i className="fas fa-arrow-left"></i>
                      </button>
                      <div>
                        <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--erp-dark)" }}>{selectedCompanyType}</h2>
                        <p style={{ color: "var(--erp-text-muted)", marginTop: "4px" }}>
                          Listing {companyTypesMap.find(m => m[0] === selectedCompanyType)?.[1].companyCount} organizations in this category.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "32px" }}>
                    {Array.from(companyTypesMap.find(m => m[0] === selectedCompanyType)?.[1].companies.entries() || []).map(([company, data]) => (
                      <div key={company} className="erp-glass erp-card-hover" style={{ padding: "24px", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(26, 86, 219, 0.1)", color: "var(--erp-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                            <i className="fas fa-building"></i>
                          </div>
                          <div>
                            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--erp-dark)" }}>{company}</h3>
                            <span style={{ fontSize: "12px", color: "var(--erp-text-muted)", fontWeight: 600 }}>{data.alumniCount} {data.alumniCount === 1 ? 'Alumnus' : 'Alumni'} Employee{data.alumniCount === 1 ? '' : 's'}</span>
                          </div>
                        </div>
                        <button className="erp-btn erp-btn--primary" onClick={() => {
                          setBatchFilter(""); // Clear batch filter when searching by company
                          setGlobalSearch(company);
                          setViewMode("directory");
                        }} style={{ width: "100%", padding: "10px", borderRadius: "8px", fontWeight: 700, fontSize: "13px" }}>
                          See Alumni
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {viewMode === "batches" && (
            <div className="erp-animate-in">
              {!selectedBatch ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                    <div>
                      <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--erp-dark)" }}>Batch Insights Hub</h2>
                      <p style={{ color: "var(--erp-text-muted)", marginTop: "6px" }}>Performance and placement snapshots for {batchesMap.length} graduation cohorts.</p>
                    </div>
                    {userRole === "admin" && (
                      <button className="erp-btn erp-btn--primary" onClick={() => setViewMode("directory")}>
                        <i className="fas fa-users" style={{ marginRight: 8 }}></i> Browse All Alumni
                      </button>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "32px" }}>
                    {batchesMap.map(([year, data]) => {
                      const topCompany = Object.entries(data.topCompanies).sort((a, b) => b[1] - a[1])[0];
                      const topCategory = Object.entries(data.topCategories).sort((a, b) => b[1] - a[1])[0];
                      return (
                        <div key={year} className="erp-glass erp-card-hover" style={{ padding: "32px", borderRadius: "24px", display: "flex", flexDirection: "column", gap: "20px", background: "#fff", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "var(--erp-shadow-sm)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(26, 86, 219, 0.05)", color: "var(--erp-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800 }}>
                              {year.toString().slice(-2)}'
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <span style={{ fontSize: "12px", color: "var(--erp-text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Batch Strength</span>
                              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--erp-dark)" }}>{data.count} Alumni</div>
                            </div>
                          </div>

                          <div style={{ background: "rgba(0,0,0,0.02)", padding: "16px", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                              <span style={{ color: "var(--erp-text-muted)" }}>Top Employer:</span>
                              <span style={{ fontWeight: 700, color: "var(--erp-dark)" }}>{topCompany ? topCompany[0] : "N/A"}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                              <span style={{ color: "var(--erp-text-muted)" }}>Main Sector:</span>
                              <span style={{ fontWeight: 700, color: "var(--erp-dark)" }}>{topCategory ? topCategory[0] : "General"}</span>
                            </div>
                          </div>

                          <button className="erp-btn erp-btn--primary" onClick={() => setSelectedBatch(year)} style={{ width: "100%", padding: "12px", borderRadius: "12px", fontWeight: 700 }}>
                            View Batch Snapshot <i className="fas fa-chart-line" style={{ marginLeft: 8 }}></i>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: "32px" }}>
                    <button 
                      className="erp-btn" 
                      onClick={() => setSelectedBatch(null)}
                      style={{ width: 44, height: 44, padding: 0, borderRadius: "50%", background: "#fff", boxShadow: "var(--erp-shadow-sm)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--erp-dark)" }}
                    >
                      <i className="fas fa-arrow-left"></i>
                    </button>
                    <div>
                      <h2 style={{ fontSize: "32px", fontWeight: 900, color: "var(--erp-dark)", letterSpacing: "-1px" }}>Class of {selectedBatch} Snapshot</h2>
                      <p style={{ color: "var(--erp-text-muted)" }}>Comprehensive placement report for this graduation year.</p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                    {/* Detailed Stats Column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                      <div className="erp-glass" style={{ padding: "32px", borderRadius: "24px" }}>
                        <h4 style={{ fontSize: "16px", fontWeight: 800, color: "var(--erp-dark)", marginBottom: "24px", display: "flex", alignItems: "center", gap: 10 }}>
                          <i className="fas fa-building" style={{ color: "var(--erp-primary)" }}></i> Top Hiring Partners
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                          {Object.entries(batchesMap.find(m => m[0] === selectedBatch)?.[1].topCompanies || {})
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 5)
                            .map(([name, count], idx) => (
                              <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(26, 86, 219, 0.1)", color: "var(--erp-primary)", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{idx + 1}</span>
                                  <span style={{ fontWeight: 600, color: "var(--erp-dark)" }}>{name}</span>
                                </div>
                                <span style={{ padding: "4px 10px", background: "#f8fafc", borderRadius: "8px", fontSize: "12px", fontWeight: 700, color: "var(--erp-text-muted)" }}>{count} Alumni</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="erp-glass" style={{ padding: "32px", borderRadius: "24px" }}>
                        <h4 style={{ fontSize: "16px", fontWeight: 800, color: "var(--erp-dark)", marginBottom: "24px", display: "flex", alignItems: "center", gap: 10 }}>
                          <i className="fas fa-user-tie" style={{ color: "var(--erp-success)" }}></i> Top Designations
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                          {Object.entries(batchesMap.find(m => m[0] === selectedBatch)?.[1].topRoles || {})
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 5)
                            .map(([name, count], idx) => (
                              <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                  <span style={{ fontWeight: 600, color: "var(--erp-dark)" }}>{name}</span>
                                </div>
                                <span style={{ color: "var(--erp-text-muted)", fontSize: "13px", fontWeight: 500 }}>{count} Alumni</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Sector Distribution Column */}
                    <div className="erp-glass" style={{ padding: "32px", borderRadius: "24px", height: "fit-content" }}>
                       <h4 style={{ fontSize: "16px", fontWeight: 800, color: "var(--erp-dark)", marginBottom: "24px", display: "flex", alignItems: "center", gap: 10 }}>
                          <i className="fas fa-chart-pie" style={{ color: "var(--erp-warning)" }}></i> Sector Distribution
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                          {Object.entries(batchesMap.find(m => m[0] === selectedBatch)?.[1].topCategories || {})
                            .sort((a, b) => b[1] - a[1])
                            .map(([name, count]) => {
                              const total = batchesMap.find(m => m[0] === selectedBatch)?.[1].count || 1;
                              const percentage = Math.round((count / total) * 100);
                              return (
                                <div key={name}>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                                    <span style={{ fontWeight: 600, color: "var(--erp-dark)" }}>{name}</span>
                                    <span style={{ color: "var(--erp-text-muted)" }}>{percentage}%</span>
                                  </div>
                                  <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: `${percentage}%`, background: "var(--erp-primary)", borderRadius: "4px" }}></div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                        <button 
                          className="erp-btn erp-btn--primary" 
                          style={{ width: "100%", marginTop: "32px" }}
                          onClick={() => {
                            setBatchFilter(selectedBatch!.toString());
                            setGlobalSearch(""); // Clear search so only the year filter is active
                            setViewMode("directory");
                          }}
                        >
                          View All {selectedBatch} Alumni In Directory
                        </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}