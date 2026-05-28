import { useState } from "react";
import { addAlumni, type NewAlumni } from "../lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  onSuccess: () => void;
}

const empty: NewAlumni = {
  full_name: "",
  email: "",
  company: "",
  company_type: "",
  designation: "",
  linkedin_url: "",
  graduation_year: new Date().getFullYear(),
  skills: "",
};

export function AddAlumniForm({ onSuccess }: Props) {
  const [form, setForm] = useState<NewAlumni>(empty);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof NewAlumni, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: field === "graduation_year" ? Number(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addAlumni(form);
      toast.success("Alumni added successfully!");
      setForm(empty);
      onSuccess();
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || err.message || "Failed to add alumni.";
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const fields: {
    name: keyof NewAlumni;
    label: string;
    type?: string;
    placeholder: string;
    full?: boolean;
  }[] = [
    { name: "full_name", label: "Full Name", placeholder: "Jane Doe" },
    { name: "email", label: "Email", type: "email", placeholder: "jane@example.com" },
    { name: "company", label: "Company", placeholder: "Google" },
    { name: "company_type", label: "Company Type", placeholder: "Industrial, Service, etc." },
    { name: "designation", label: "Designation", placeholder: "Software Engineer" },
    {
      name: "linkedin_url",
      label: "LinkedIn URL",
      type: "url",
      placeholder: "https://linkedin.com/in/...",
      full: true,
    },
    { name: "graduation_year", label: "Graduation Year", type: "number", placeholder: "2024" },
    { name: "skills", label: "Skills / Tags", placeholder: "Python, React, AWS (Comma separated)" },
  ];

  return (
    <div className="erp-card erp-animate-in">
      <div className="erp-card__header">
        <div>
          <div className="erp-card__title">Add New Alumni</div>
          <div className="erp-card__subtitle">Fill in the alumni details</div>
        </div>
      </div>
      <div className="erp-card__body">
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            {fields.map((f) => (
              <div
                key={f.name}
                className="erp-form-group"
                style={f.full ? { gridColumn: "1 / -1" } : undefined}
              >
                <label>{f.label}</label>
                <input
                  className="erp-form-control"
                  type={f.type ?? "text"}
                  required
                  placeholder={f.placeholder}
                  value={form[f.name] as string | number}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
            <button
              type="submit"
              className="erp-btn erp-btn--primary"
              disabled={submitting}
              style={submitting ? { opacity: 0.7, cursor: "not-allowed" } : undefined}
            >
              {submitting ? <Loader2 className="animate-spin" size={16} /> : "+ Add Alumni"}
            </button>
            <button
              type="button"
              className="erp-btn erp-btn--ghost"
              onClick={() => setForm(empty)}
              disabled={submitting}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
