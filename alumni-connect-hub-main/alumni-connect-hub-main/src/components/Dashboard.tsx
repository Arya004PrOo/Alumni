import { useCallback, useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import { AlumniTable } from "./AlumniTable";
import { AddAlumniForm } from "./AddAlumniForm";
import { fetchAllAlumni, fetchAlumniCount } from "../lib/api";

// define Alumni type if you wanna avoid the errors further down the line. 
type Alumni = {
  id: number;
  full_name: string;
  email: string;
  company?: string;
  designation?: string;
  linkedin_url?: string;
  graduation_year: number;
};

export function Dashboard() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    loadAlumni();
    loadCount();
  }, [loadAlumni, loadCount]);

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

  return (
    <div style={{ minHeight: "100vh", background: "var(--erp-surface)" }}>
      <Navbar />

      <main className="erp-main" style={{ padding: "28px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
          <div className="erp-page-title">
            <h1>Alumni Overview</h1>
            <p>Track and manage your college alumni network.</p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(220px, 1fr))",
              gap: 20,
              marginBottom: 32,
            }}
          >
            <div className="erp-stat-card erp-stat-card--primary">
              <div className="erp-stat-card__header">
                <div>
                  <span style={{ fontSize: 12, color: "var(--erp-text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Total Alumni
                  </span>
                  <div style={{ fontSize: 32, fontWeight: 700, color: "var(--erp-primary)", marginTop: 10 }}>
                    {count ?? alumni.length}
                  </div>
                </div>
                <div className="erp-stat-card__icon">
                  <i className="fas fa-user-graduate"></i>
                </div>
              </div>
            </div>
            <div className="erp-stat-card erp-stat-card--success">
              <div className="erp-stat-card__header">
                <div>
                  <span style={{ fontSize: 12, color: "var(--erp-text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Unique Companies
                  </span>
                  <div style={{ fontSize: 32, fontWeight: 700, color: "var(--erp-primary)", marginTop: 10 }}>
                    {uniqueCompanies}
                  </div>
                </div>
                <div className="erp-stat-card__icon">
                  <i className="fas fa-building"></i>
                </div>
              </div>
            </div>
            <div className="erp-stat-card erp-stat-card--warning">
              <div className="erp-stat-card__header">
                <div>
                  <span style={{ fontSize: 12, color: "var(--erp-text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Latest Batch
                  </span>
                  <div style={{ fontSize: 32, fontWeight: 700, color: "var(--erp-primary)", marginTop: 10 }}>
                    {latestYear || "-"}
                  </div>
                </div>
                <div className="erp-stat-card__icon">
                  <i className="fas fa-graduation-cap"></i>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 28 }}>
            <AddAlumniForm onSuccess={handleSuccess} />
            <AlumniTable alumni={alumni} loading={loading} error={error} />
          </div>
        </div>
      </main>
    </div>
  );
}