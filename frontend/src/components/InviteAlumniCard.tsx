import { useState } from "react";
import { inviteAlumni } from "../lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function InviteAlumniCard() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);

    try {
      // 1. Log the invitation in the backend database
      const res = await inviteAlumni(email);
      
      // 2. Prepare the email draft content
      const subject = encodeURIComponent("Invitation to join the Alumni Connect Hub");
      const body = encodeURIComponent(
        `Hello,\n\nWe would love for you to join our Alumni Connect Hub. ` +
        `It's a great place to stay connected with your peers and track career progress.\n\n` +
        `Please join us here: https://automatic-certify-appointee.ngrok-free.dev/register?email=${email}\n\n` +
        `Best regards,\nAlumni Team`
      );

      // 3. Trigger the system's default email client (mailto redirect)
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      
      toast.success("Invitation draft opened in your mail app!");
      setEmail("");
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || err.message || "Failed to process invitation";
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="erp-card erp-animate-in erp-card-hover" style={{ 
      height: "fit-content", 
      background: "linear-gradient(135deg, var(--erp-primary) 0%, var(--erp-primary-dark) 100%)",
      border: "none",
      color: "#fff"
    }}>
      <div className="erp-card__header" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div>
          <div className="erp-card__title" style={{ color: "#fff", fontSize: "16px" }}>Join the Network</div>
          <div className="erp-card__subtitle" style={{ color: "rgba(255,255,255,0.7)" }}>Send an invitation to join the Alumni Hub</div>
        </div>
        <div className="erp-card__icon" style={{ color: "var(--erp-accent)", background: "rgba(255,255,255,0.1)" }}>
          <i className="fas fa-paper-plane"></i>
        </div>
      </div>
      <div className="erp-card__body" style={{ padding: "24px" }}>
        <form onSubmit={handleInvite}>
          <div className="erp-form-group">
            <label style={{ color: "rgba(255,255,255,0.8)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>Alumni Email Address</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
              <input
                type="email"
                className="erp-form-control"
                placeholder="alumni@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ 
                  background: "rgba(255,255,255,0.1)", 
                  border: "1px solid rgba(255,255,255,0.2)", 
                  color: "#fff",
                  padding: "12px 16px"
                }}
              />
              <button 
                type="submit" 
                className="erp-btn" 
                disabled={submitting}
                style={{ 
                  background: "#fff", 
                  color: "var(--erp-primary)",
                  width: "100%",
                  justifyContent: "center",
                  padding: "12px",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)"
                }}
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : (
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    Send Invitation <i className="fas fa-arrow-right" style={{ fontSize: "12px" }}></i>
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
