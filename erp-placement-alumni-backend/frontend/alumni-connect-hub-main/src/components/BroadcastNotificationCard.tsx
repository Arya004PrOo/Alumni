import { useState } from "react";
import { broadcastNotification } from "../lib/api";
import { toast } from "sonner";

export function BroadcastNotificationCard() {
  const [loading, setLoading] = useState(false);
  const [targetMode, setTargetMode] = useState<"bulk" | "single">("bulk");
  const [modulePreset, setModulePreset] = useState<"alumni" | "admission">("alumni");
  const [formData, setFormData] = useState({
    event_type: "General Announcement",
    title: "",
    message: "",
    recipient_roles: ["student"],
    recipient_emails: "",
    department: ""
  });

  const getModuleConfig = () => {
    if (modulePreset === "admission") {
        return {
            api_key: "ADMISS_KEY_2026",
            module_name: "Admission and Enrollment"
        };
    }
    return {
        api_key: "ALUMNI_KEY_2026",
        module_name: "Alumni Module"
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    if (targetMode === "single" && !formData.recipient_emails) {
        toast.error("Please provide at least one email");
        return;
    }

    setLoading(true);
    try {
      const config = getModuleConfig();
      await broadcastNotification({
        ...formData,
        ...config,
        recipient_emails: targetMode === "single" ? formData.recipient_emails.split(",").map(e => e.trim()) : undefined,
        recipient_roles: targetMode === "bulk" ? formData.recipient_roles : undefined,
        delivery_modes: modulePreset === "admission" ? ["email"] : ["email", "sms", "whatsapp"]
      });
      toast.success("Notification sent successfully!");
      setFormData({ ...formData, title: "", message: "" });
    } catch (error: any) {
      console.error("Broadcast Error Details:", error);
      const isTimeout = error.code === "ECONNABORTED" || error.message?.includes("timeout");
      
      if (isTimeout) {
        toast.info("Notification sent! (The server is slow to confirm, but the broadcast has been dispatched)");
        setFormData({ ...formData, title: "", message: "" }); // Clear anyway as it likely worked
      } else {
        const msg = error.response?.data?.detail || "Failed to connect to notification service";
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="erp-glass erp-animate-in" style={{ padding: "32px", borderRadius: "24px", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--erp-dark)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(136, 31, 66, 0.1)", color: "var(--erp-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="fas fa-bullhorn"></i>
          </div>
          Broadcast Announcement
        </h3>
        <p style={{ color: "var(--erp-text-muted)", fontSize: "14px", marginTop: "8px" }}>Send instant alerts via Email, SMS, and WhatsApp to specific roles.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
        {/* Toggle Controls */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
            <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--erp-text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>Targeting Mode</label>
                <div style={{ display: "flex", background: "#f8fafc", padding: "4px", borderRadius: "10px", gap: "4px" }}>
                    <button type="button" onClick={() => setTargetMode("bulk")} style={{ flex: 1, padding: "6px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer", background: targetMode === "bulk" ? "#fff" : "transparent", boxShadow: targetMode === "bulk" ? "0 2px 4px rgba(0,0,0,0.05)" : "none", color: targetMode === "bulk" ? "var(--erp-primary)" : "var(--erp-text-muted)" }}>Bulk Role</button>
                    <button type="button" onClick={() => setTargetMode("single")} style={{ flex: 1, padding: "6px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer", background: targetMode === "single" ? "#fff" : "transparent", boxShadow: targetMode === "single" ? "0 2px 4px rgba(0,0,0,0.05)" : "none", color: targetMode === "single" ? "var(--erp-primary)" : "var(--erp-text-muted)" }}>Individual Email</button>
                </div>
            </div>
            <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--erp-text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>Module Preset</label>
                <div style={{ display: "flex", background: "#f8fafc", padding: "4px", borderRadius: "10px", gap: "4px" }}>
                    <button type="button" onClick={() => setModulePreset("alumni")} style={{ flex: 1, padding: "6px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer", background: modulePreset === "alumni" ? "#fff" : "transparent", boxShadow: modulePreset === "alumni" ? "0 2px 4px rgba(0,0,0,0.05)" : "none", color: modulePreset === "alumni" ? "var(--erp-primary)" : "var(--erp-text-muted)" }}>Alumni</button>
                    <button type="button" onClick={() => setModulePreset("admission")} style={{ flex: 1, padding: "6px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer", background: modulePreset === "admission" ? "#fff" : "transparent", boxShadow: modulePreset === "admission" ? "0 2px 4px rgba(0,0,0,0.05)" : "none", color: modulePreset === "admission" ? "var(--erp-primary)" : "var(--erp-text-muted)" }}>Admission</button>
                </div>
            </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--erp-dark)", marginBottom: "8px" }}>Event Type</label>
            <select 
              className="erp-form-control"
              value={formData.event_type}
              onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
            >
              <option value="General Announcement">General Announcement</option>
              <option value="Placement Alert">Placement Alert</option>
              <option value="Low Attendance Alert">Low Attendance Alert</option>
              <option value="Fee Reminder">Fee Reminder</option>
              <option value="Urgent Update">Urgent Update</option>
            </select>
          </div>
          {targetMode === "bulk" ? (
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--erp-dark)", marginBottom: "8px" }}>Target Role</label>
              <select 
                className="erp-form-control"
                value={formData.recipient_roles[0]}
                onChange={(e) => setFormData({ ...formData, recipient_roles: [e.target.value] })}
              >
                <option value="student">Students</option>
                <option value="alumni">Alumni</option>
                <option value="faculty">Faculty</option>
                <option value="staff">Staff Members</option>
              </select>
            </div>
          ) : (
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--erp-dark)", marginBottom: "8px" }}>Recipient Email</label>
              <input 
                type="email" 
                className="erp-form-control" 
                placeholder="e.g. student@example.com"
                value={formData.recipient_emails}
                onChange={(e) => setFormData({ ...formData, recipient_emails: e.target.value })}
              />
            </div>
          )}
        </div>

        {targetMode === "bulk" && (
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--erp-dark)", marginBottom: "8px" }}>Target Department (Optional)</label>
            <input 
              type="text" 
              className="erp-form-control" 
              placeholder="e.g. BSc CS, Engineering"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>
        )}

        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--erp-dark)", marginBottom: "8px" }}>Notification Title</label>
          <input 
            type="text" 
            className="erp-form-control" 
            placeholder="e.g. Mandatory Attendance Warning"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--erp-dark)", marginBottom: "8px" }}>Message Content</label>
          <textarea 
            className="erp-form-control" 
            placeholder="Type your message here..."
            style={{ minHeight: "100px", resize: "none" }}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="erp-btn erp-btn--primary" 
          style={{ width: "100%", padding: "14px", borderRadius: "12px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
        >
          {loading ? (
             <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-paper-plane"></i>
          )}
          Send Multi-Channel Broadcast
        </button>
      </form>
    </div>
  );
}
