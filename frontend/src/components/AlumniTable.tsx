import { useState, useMemo, useEffect } from "react";
import { Loader2, Trash2, FolderSearch, Download, Linkedin, Mail, Edit2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { deleteAlumni, updateAlumni } from "../lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

type Alumni = {
  id: number;
  full_name: string;
  email: string;
  company?: string;
  company_type?: string;
  designation?: string;
  graduation_year: number;
  skills?: string;
  linkedin_url?: string;
};

type Props = {
  alumni: Alumni[];
  loading: boolean;
  error: string | null;
  userRole?: "admin" | "student" | "alumni";
  onDeleteSuccess?: () => void;
  initialSearchQuery?: string;
  initialYearFilter?: string;
  onSearchChange?: (query: string) => void;
  onYearFilterChange?: (year: string) => void;
};

export function AlumniTable({ 
  alumni, 
  loading, 
  error, 
  userRole = "admin", 
  onDeleteSuccess, 
  initialSearchQuery = "", 
  initialYearFilter = "",
  onSearchChange,
  onYearFilterChange
}: Props) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [yearFilter, setYearFilter] = useState(initialYearFilter);

  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  useEffect(() => {
    if (initialYearFilter !== undefined) {
      setYearFilter(initialYearFilter);
    }
  }, [initialYearFilter]);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [alumniToDelete, setAlumniToDelete] = useState<Alumni | null>(null);
  const [alumniToEdit, setAlumniToEdit] = useState<Alumni | null>(null);
  const [editForm, setEditForm] = useState<Alumni | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Alumni, direction: "asc" | "desc" } | null>({ key: "full_name", direction: "asc" });
  const [skillFilter, setSkillFilter] = useState("");

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    setAlumniToDelete(null);
    try {
      await deleteAlumni(id);
      toast.success("Alumni record deleted forever.");
      if (onDeleteSuccess) onDeleteSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || "Failed to delete alumni");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditClick = (a: Alumni) => {
    setAlumniToEdit(a);
    setEditForm({ ...a });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    
    setIsUpdating(true);
    try {
      await updateAlumni(editForm.id, {
        full_name: editForm.full_name,
        email: editForm.email,
        company: editForm.company,
        company_type: editForm.company_type,
        designation: editForm.designation,
        linkedin_url: editForm.linkedin_url,
        graduation_year: editForm.graduation_year,
        skills: editForm.skills,
      });
      toast.success("Alumni record updated successfully!");
      setAlumniToEdit(null);
      if (onDeleteSuccess) onDeleteSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update alumni");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSort = (key: keyof Alumni) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const uniqueSkills = useMemo(() => {
    const skills = new Set<string>();
    alumni.forEach(a => {
      if (a.skills) {
        a.skills.split(",").forEach(s => {
          const trimmed = s.trim();
          if (trimmed) skills.add(trimmed);
        });
      }
    });
    return Array.from(skills).sort();
  }, [alumni]);

  const filteredAlumni = useMemo(() => {
    let result = alumni.filter((a) => {
      const matchesSearch = 
        !searchQuery || 
        a.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.company && a.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (a.designation && a.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (a.skills && a.skills.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesYear = !yearFilter || a.graduation_year.toString() === yearFilter;
      const matchesSkill = !skillFilter || (a.skills && a.skills.split(",").map(s => s.trim()).includes(skillFilter));

      return matchesSearch && matchesYear && matchesSkill;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        
        if (valA === undefined || valB === undefined) return 0;
        if (valA === null || valB === null) return 0;

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [alumni, searchQuery, yearFilter, skillFilter, sortConfig]);

  const uniqueYears = useMemo(() => {
    const years = new Set(alumni.map(a => a.graduation_year));
    return Array.from(years).sort((a, b) => b - a);
  }, [alumni]);

  const handleExport = () => {
    if (filteredAlumni.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ["ID", "Full Name", "Email", "Company", "Designation", "Graduation Year", "Skills", "LinkedIn"];
    const csvRows = filteredAlumni.map(a => [
      a.id,
      `"${a.full_name.replace(/"/g, '""')}"`,
      `"${a.email.replace(/"/g, '""')}"`,
      `"${(a.company || "").replace(/"/g, '""')}"`,
      `"${(a.designation || "").replace(/"/g, '""')}"`,
      a.graduation_year,
      `"${(a.skills || "").replace(/"/g, '""')}"`,
      `"${(a.linkedin_url || "").replace(/"/g, '""')}"`
    ].join(","));

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `alumni_export_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Alumni list exported to CSV!");
  };

  if (loading) {
    return (
      <div className="erp-card" style={{ height: "400px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--erp-text-muted)" }}>
        <Loader2 className="animate-spin" size={40} style={{ marginBottom: 16, color: "var(--erp-primary)" }} />
        <p>Loading alumni directory...</p>
      </div>
    );
  }

  if (error) return <div className="erp-alert erp-alert--danger">{error}</div>;

  return (
    <div className="erp-card erp-animate-in">
      <div className="erp-card__header">
        <div>
          <div className="erp-card__title">Alumni Directory</div>
          <div className="erp-card__subtitle">Browse and export the latest alumni records.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button 
            className="erp-btn" 
            onClick={handleExport}
            style={{ 
              fontSize: "12px", 
              padding: "6px 14px", 
              background: "rgba(26, 86, 219, 0.05)", 
              color: "var(--erp-primary)", 
              border: "1px solid rgba(26, 86, 219, 0.1)",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Download size={14} />
            Export CSV
          </button>
          <div className="erp-badge erp-badge--info">{filteredAlumni.length} records</div>
        </div>
      </div>

      <div style={{ padding: "20px 24px", display: "flex", gap: "16px", borderBottom: "1px solid var(--erp-border)", background: "var(--erp-white)", borderRadius: "var(--erp-radius-lg) var(--erp-radius-lg) 0 0" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <i className="fas fa-search" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--erp-text-muted)", fontSize: "14px" }}></i>
          <input 
            type="text" 
            placeholder="Search alumni network..." 
            className="erp-form-control" 
            style={{ paddingLeft: "40px", width: "100%", boxShadow: "var(--erp-shadow-sm)" }}
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              if (onSearchChange) onSearchChange(val);
            }}
          />
        </div>
        <select 
          className="erp-form-control" 
          style={{ width: "180px", boxShadow: "var(--erp-shadow-sm)" }}
          value={yearFilter}
          onChange={(e) => {
            const val = e.target.value;
            setYearFilter(val);
            if (onYearFilterChange) onYearFilterChange(val);
          }}
        >
          <option value="">Year Batch</option>
          {uniqueYears.map(year => (
            <option key={year} value={year.toString()}>{year}</option>
          ))}
        </select>
        <select 
          className="erp-form-control" 
          style={{ width: "180px", boxShadow: "var(--erp-shadow-sm)" }}
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
        >
          <option value="">Filter by Skill</option>
          {uniqueSkills.map(skill => (
            <option key={skill} value={skill}>{skill}</option>
          ))}
        </select>
      </div>

      <div className="erp-card__body" style={{ padding: 0, overflowX: "auto", maxHeight: "600px" }}>
        <table className="erp-table" style={{ minWidth: 700, borderCollapse: "separate", borderSpacing: 0 }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--erp-surface)" }}>
            <tr>
              <th 
                style={{ background: "inherit", fontWeight: 700, textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px", cursor: "pointer" }}
                onClick={() => handleSort("full_name")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  Name 
                  {sortConfig?.key === "full_name" ? (
                    sortConfig.direction === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                  ) : <ArrowUpDown size={12} style={{ opacity: 0.3 }} />}
                </div>
              </th>
              <th style={{ background: "inherit", fontWeight: 700, textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>Email</th>
              <th style={{ background: "inherit", fontWeight: 700, textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>Company</th>
              <th style={{ background: "inherit", fontWeight: 700, textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>Company Type</th>
              <th style={{ background: "inherit", fontWeight: 700, textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>Designation</th>
              <th style={{ background: "inherit", fontWeight: 700, textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>Skills</th>
              <th 
                style={{ background: "inherit", fontWeight: 700, textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px", cursor: "pointer" }}
                onClick={() => handleSort("graduation_year")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  Year
                  {sortConfig?.key === "graduation_year" ? (
                    sortConfig.direction === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                  ) : <ArrowUpDown size={12} style={{ opacity: 0.3 }} />}
                </div>
              </th>
              <th style={{ background: "inherit", fontWeight: 700, textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px", textAlign: "center" }}>LinkedIn</th>
              <th style={{ background: "inherit", textAlign: "right", fontWeight: 700, textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlumni.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "80px 20px", textAlign: "center", color: "var(--erp-text-muted)" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                    <div style={{ padding: "20px", background: "var(--erp-surface)", borderRadius: "50%" }}>
                      <FolderSearch size={48} color="var(--erp-text-muted)" style={{ opacity: 0.5 }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "16px", color: "var(--erp-text)" }}>
                        {alumni.length === 0 ? "Directory is empty" : "No matches found"}
                      </div>
                      <p style={{ marginTop: 4, fontSize: "14px" }}>
                        {alumni.length === 0 
                          ? "Start building your alumni network by adding your first record." 
                          : "We couldn't find anyone matching your search filters. Try adjusting them."}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAlumni.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600, color: "var(--erp-primary)" }}>{a.full_name}</td>
                  <td>
                    <a 
                      href={`mailto:${a.email}`} 
                      style={{ 
                        color: "var(--erp-text-muted)", 
                        fontSize: "13px", 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: "6px",
                        textDecoration: "none",
                        transition: "color 0.2s"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.color = "var(--erp-primary)"}
                      onMouseOut={(e) => e.currentTarget.style.color = "var(--erp-text-muted)"}
                      title={`Send email to ${a.full_name}`}
                    >
                      <Mail size={14} style={{ opacity: 0.7 }} />
                      {a.email}
                    </a>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{a.company || "-"}</span>
                  </td>
                  <td>
                    {a.company_type ? (
                      <span className="erp-badge" style={{ 
                        fontSize: "10px", 
                        padding: "3px 8px", 
                        background: "rgba(100, 116, 139, 0.1)", 
                        color: "var(--erp-text-muted)",
                        fontWeight: 600,
                        borderRadius: "4px"
                      }}>
                        {a.company_type}
                      </span>
                    ) : "-"}
                  </td>
                  <td>
                    <span style={{ fontSize: "13px", color: "var(--erp-text)" }}>{a.designation || "-"}</span>
                  </td>
                  <td>
                    {a.skills ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {a.skills.split(",").map((skill, i) => (
                          <span key={i} className="erp-badge" style={{ 
                            fontSize: "10px", 
                            padding: "3px 10px", 
                            background: "rgba(26, 86, 219, 0.08)", 
                            color: "var(--erp-primary)",
                            border: "1px solid rgba(26, 86, 219, 0.1)",
                            fontWeight: 600,
                            borderRadius: "100px"
                          }}>
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    ) : "-"}
                  </td>
                  <td>
                    <div className="erp-badge erp-badge--info" style={{ fontWeight: 700, borderRadius: "6px" }}>{a.graduation_year}</div>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {a.linkedin_url ? (
                      <a 
                        href={a.linkedin_url} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ color: "#0077b5", display: "inline-flex", padding: "8px", borderRadius: "50%", background: "rgba(0, 119, 181, 0.05)", transition: "all 0.2s" }}
                        title="Open LinkedIn Profile"
                        className="linkedin-link-hover"
                      >
                        <Linkedin size={18} fill="currentColor" />
                      </a>
                    ) : "-"}
                  </td>
                  <td style={{ textAlign: "right", display: "flex", gap: "8px", justifyContent: "flex-end", alignItems: "center" }}>
                    {userRole === "admin" && (
                      <>
                        <button 
                          className="erp-btn" 
                          onClick={() => handleEditClick(a)}
                          style={{ padding: "6px 10px", color: "var(--erp-primary)", background: "rgba(26, 86, 219, 0.1)", border: "none" }}
                          title="Edit Record"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="erp-btn" 
                          onClick={() => setAlumniToDelete(a)}
                          style={{ padding: "6px 10px", color: "var(--erp-danger)", background: "rgba(239, 68, 68, 0.1)", border: "none" }}
                          title="Delete Record"
                          disabled={isDeleting === a.id}
                        >
                          {isDeleting === a.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </>
                    )}
                    {userRole !== "admin" && (
                       <span style={{ fontSize: '11px', color: 'var(--erp-text-muted)', fontStyle: 'italic' }}>Read-only</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!alumniToDelete} onOpenChange={(open) => !open && setAlumniToDelete(null)}>
        <AlertDialogContent className="!p-0 !gap-0 overflow-hidden" style={{ borderRadius: "var(--erp-radius-lg)" }}>
          <AlertDialogHeader className="erp-modal__header">
            <AlertDialogTitle className="erp-modal__title" style={{ fontSize: "16px" }}>Are you absolutely sure?</AlertDialogTitle>
          </AlertDialogHeader>
          
          <div className="erp-modal__body">
            <AlertDialogDescription style={{ fontSize: "13.5px", color: "var(--erp-text)", lineHeight: "1.5" }}>
              This will permanently delete <strong>{alumniToDelete?.full_name}</strong>'s record from our servers.
              This action cannot be undone.
            </AlertDialogDescription>
          </div>

          <AlertDialogFooter className="erp-modal__footer">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => alumniToDelete && handleDelete(alumniToDelete.id)}
              className="erp-btn--danger"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!alumniToEdit} onOpenChange={(open) => !open && setAlumniToEdit(null)}>
        <DialogContent className="!p-0 !gap-0 overflow-hidden" style={{ borderRadius: "var(--erp-radius-lg)", maxWidth: "600px" }}>
          <DialogHeader className="erp-modal__header">
            <DialogTitle className="erp-modal__title">Edit Alumni Record</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUpdate}>
            <div className="erp-modal__body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="erp-form-group">
                <label>Full Name</label>
                <input 
                  className="erp-form-control" 
                  value={editForm?.full_name || ""} 
                  onChange={(e) => setEditForm(prev => prev ? ({ ...prev, full_name: e.target.value }) : null)}
                  required
                />
              </div>
              <div className="erp-form-group">
                <label>Email Address</label>
                <input 
                  className="erp-form-control" 
                  type="email"
                  value={editForm?.email || ""} 
                  onChange={(e) => setEditForm(prev => prev ? ({ ...prev, email: e.target.value }) : null)}
                  required
                />
              </div>
              <div className="erp-form-group">
                <label>Company</label>
                <input 
                  className="erp-form-control" 
                  value={editForm?.company || ""} 
                  onChange={(e) => setEditForm(prev => prev ? ({ ...prev, company: e.target.value }) : null)}
                />
              </div>
              <div className="erp-form-group">
                <label>Company Type</label>
                <input 
                  className="erp-form-control" 
                  placeholder="Industrial, Service, etc."
                  value={editForm?.company_type || ""} 
                  onChange={(e) => setEditForm(prev => prev ? ({ ...prev, company_type: e.target.value }) : null)}
                />
              </div>
              <div className="erp-form-group">
                <label>Designation</label>
                <input 
                  className="erp-form-control" 
                  value={editForm?.designation || ""} 
                  onChange={(e) => setEditForm(prev => prev ? ({ ...prev, designation: e.target.value }) : null)}
                />
              </div>
              <div className="erp-form-group" style={{ gridColumn: "1 / -1" }}>
                <label>LinkedIn URL</label>
                <input 
                  className="erp-form-control" 
                  type="url"
                  value={editForm?.linkedin_url || ""} 
                  onChange={(e) => setEditForm(prev => prev ? ({ ...prev, linkedin_url: e.target.value }) : null)}
                />
              </div>
              <div className="erp-form-group">
                <label>Graduation Year</label>
                <input 
                  className="erp-form-control" 
                  type="number"
                  value={editForm?.graduation_year || ""} 
                  onChange={(e) => setEditForm(prev => prev ? ({ ...prev, graduation_year: Number(e.target.value) }) : null)}
                  required
                />
              </div>
              <div className="erp-form-group">
                <label>Skills / Tags</label>
                <input 
                  className="erp-form-control" 
                  value={editForm?.skills || ""} 
                  onChange={(e) => setEditForm(prev => prev ? ({ ...prev, skills: e.target.value }) : null)}
                  placeholder="React, Python, etc."
                />
              </div>
            </div>

            <div className="erp-modal__footer">
              <button type="button" className="erp-btn erp-btn--ghost" onClick={() => setAlumniToEdit(null)}>Cancel</button>
              <button type="submit" className="erp-btn erp-btn--primary" disabled={isUpdating}>
                {isUpdating ? <Loader2 className="animate-spin" size={16} /> : "Update Record"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}