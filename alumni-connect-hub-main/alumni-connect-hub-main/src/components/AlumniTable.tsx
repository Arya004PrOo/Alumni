type Alumni = {
  id: number;
  full_name: string;
  email: string;
  company?: string;
  designation?: string;
  graduation_year: number;
};

type Props = {
  alumni: Alumni[];
  loading: boolean;
  error: string | null;
};

export function AlumniTable({ alumni, loading, error }: Props) {
  if (loading) return <div className="erp-alert erp-alert--info">Loading alumni...</div>;
  if (error) return <div className="erp-alert erp-alert--danger">{error}</div>;

  return (
    <div className="erp-card erp-animate-in">
      <div className="erp-card__header">
        <div>
          <div className="erp-card__title">Alumni Directory</div>
          <div className="erp-card__subtitle">Browse the latest alumni records.</div>
        </div>
        <div className="erp-badge erp-badge--info">{alumni.length} records</div>
      </div>

      <div className="erp-card__body" style={{ padding: 0, overflowX: "auto" }}>
        <table className="erp-table" style={{ minWidth: 700 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Designation</th>
              <th>Year</th>
            </tr>
          </thead>
          <tbody>
            {alumni.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 20, textAlign: "center", color: "var(--erp-text-muted)" }}>
                  No alumni found. Add your first alumni to populate the directory.
                </td>
              </tr>
            ) : (
              alumni.map((a) => (
                <tr key={a.id}>
                  <td>{a.full_name}</td>
                  <td>{a.email}</td>
                  <td>{a.company || "-"}</td>
                  <td>{a.designation || "-"}</td>
                  <td>{a.graduation_year}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}