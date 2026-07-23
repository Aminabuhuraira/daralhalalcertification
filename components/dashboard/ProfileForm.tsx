"use client";
import { useState } from "react";
import GlowingCard from "@/components/ui/GlowingCard";
import { CERTIFICATION_SECTORS } from "@/lib/sectors";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px",
  background: "#fafafa",
  border: "1px solid rgba(10,21,53,0.12)",
  borderRadius: 8,
  fontFamily: "var(--font-body)", fontSize: 14, color: "#0A1535",
  outline: "none", transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.68)",
  marginBottom: 6, display: "block", fontWeight: 500,
};

type User = { name: string; email: string; businessName: string | null; sector: string | null; phone: string | null };

export default function ProfileForm({ user }: { user: User }) {
  const [name, setName]                 = useState(user.name);
  const [businessName, setBusinessName] = useState(user.businessName || "");
  const [sector, setSector]             = useState(user.sector || "");
  const [phone, setPhone]               = useState(user.phone || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]   = useState("");
  const [saving, setSaving]             = useState(false);
  const [message, setMessage]           = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = "#C9A227");
  const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = "rgba(10,21,53,0.12)");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const body: Record<string, string> = { name, businessName, sector, phone };
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setMessage({ type: "error", text: data.error || "Something went wrong." }); return; }
      setCurrentPassword("");
      setNewPassword("");
      setMessage({ type: "ok", text: "Profile updated successfully." });
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlowingCard style={{ padding: "28px 30px", maxWidth: 520 }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={labelStyle}>Email address</label>
          <input value={user.email} disabled style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }} />
        </div>
        <div>
          <label style={labelStyle}>Full Name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
        </div>
        <div>
          <label style={labelStyle}>Business Name</label>
          <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
        </div>
        <div>
          <label style={labelStyle}>Sector</label>
          <select value={sector} onChange={(e) => setSector(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} onFocus={focusBorder} onBlur={blurBorder}>
            <option value="">Select a sector…</option>
            {CERTIFICATION_SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
        </div>

        <div style={{ borderTop: "1px solid rgba(10,21,53,0.08)", paddingTop: 16, marginTop: 4 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 500, color: "#0A1535", marginBottom: 12 }}>Change Password</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={inputStyle} placeholder="Current password" onFocus={focusBorder} onBlur={blurBorder} />
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} placeholder="New password (min 8 characters)" onFocus={focusBorder} onBlur={blurBorder} />
          </div>
        </div>

        {message && (
          <p style={{ fontSize: 13, fontFamily: "var(--font-body)", color: message.type === "ok" ? "#22c55e" : "#ef4444" }}>{message.text}</p>
        )}

        <button type="submit" disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </GlowingCard>
  );
}
