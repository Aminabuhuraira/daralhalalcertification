"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import GlowingCard from "@/components/ui/GlowingCard";
import { CERTIFICATION_SECTORS } from "@/lib/sectors";

type UserData = {
  name: string;
  email: string;
  businessName: string | null;
  sector: string | null;
  phone: string | null;
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px",
  background: "#fafafa", border: "1px solid rgba(10,21,53,0.12)",
  borderRadius: 8, fontFamily: "var(--font-body)", fontSize: 14, color: "#0A1535", outline: "none",
};

const label: React.CSSProperties = {
  fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.5)", marginBottom: 6, display: "block", fontWeight: 500,
};

const TABS = [
  { id: "account",  label: "Account",  icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "danger",   label: "Danger Zone", icon: AlertTriangle },
] as const;
type Tab = typeof TABS[number]["id"];

export default function UserSettings({ user, locale }: { user: UserData; locale: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("account");

  // Account fields
  const [name, setName]                 = useState(user.name);
  const [businessName, setBusinessName] = useState(user.businessName || "");
  const [sector, setSector]             = useState(user.sector || "");
  const [phone, setPhone]               = useState(user.phone || "");
  const [acctSaving, setAcctSaving]     = useState(false);
  const [acctMsg, setAcctMsg]           = useState<{ ok: boolean; text: string } | null>(null);

  // Security fields
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd]         = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdSaving, setPwdSaving]   = useState(false);
  const [pwdMsg, setPwdMsg]         = useState<{ ok: boolean; text: string } | null>(null);

  // Danger zone
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting]           = useState(false);
  const [deleteMsg, setDeleteMsg]         = useState("");

  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = "#C9A227");
  const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = "rgba(10,21,53,0.12)");

  const saveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAcctSaving(true); setAcctMsg(null);
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, businessName, sector, phone }),
    });
    const data = await res.json();
    setAcctSaving(false);
    setAcctMsg(res.ok ? { ok: true, text: "Account updated successfully." } : { ok: false, text: data.error || "Something went wrong." });
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { setPwdMsg({ ok: false, text: "New passwords do not match." }); return; }
    if (newPwd.length < 8)     { setPwdMsg({ ok: false, text: "New password must be at least 8 characters." }); return; }
    setPwdSaving(true); setPwdMsg(null);
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, currentPassword: currentPwd, newPassword: newPwd }),
    });
    const data = await res.json();
    setPwdSaving(false);
    if (res.ok) { setCurrentPwd(""); setNewPwd(""); setConfirmPwd(""); setPwdMsg({ ok: true, text: "Password updated." }); }
    else setPwdMsg({ ok: false, text: data.error || "Failed to update password." });
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== user.email) { setDeleteMsg("Email does not match."); return; }
    setDeleting(true);
    const res = await fetch("/api/account/profile", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: deleteConfirm }),
    });
    setDeleting(false);
    if (res.ok) {
      router.push("/");
    } else {
      const data = await res.json().catch(() => ({}));
      setDeleteMsg(data.error || "Failed to delete account. Please try again.");
    }
  };

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: "1px solid rgba(10,21,53,0.08)", paddingBottom: 0 }}>
        {TABS.map(t => {
          const active = tab === t.id;
          const isDanger = t.id === "danger";
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "10px 18px", background: "none", border: "none",
                cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: active ? 700 : 500,
                color: active ? (isDanger ? "#ef4444" : "#9a7810") : isDanger ? "rgba(239,68,68,0.7)" : "rgba(10,21,53,0.5)",
                borderBottom: active ? `2px solid ${isDanger ? "#ef4444" : "#C9A227"}` : "2px solid transparent",
                marginBottom: -1, transition: "all 0.15s",
              }}
            >
              <t.icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Account Tab ── */}
      {tab === "account" && (
        <GlowingCard style={{ padding: "28px 30px", maxWidth: 520 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "#0A1535", marginBottom: 20 }}>Account Information</h2>
          <form onSubmit={saveAccount} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={label}>Email address</label>
              <input value={user.email} disabled style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }} />
              <p style={{ fontSize: 11.5, color: "rgba(10,21,53,0.4)", marginTop: 5, fontFamily: "var(--font-body)" }}>Email cannot be changed. Contact support if needed.</p>
            </div>
            <div>
              <label style={label}>Full Name *</label>
              <input required value={name} onChange={e => setName(e.target.value)} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
            <div>
              <label style={label}>Business Name</label>
              <input value={businessName} onChange={e => setBusinessName(e.target.value)} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
            <div>
              <label style={label}>Industry Sector</label>
              <select value={sector} onChange={e => setSector(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} onFocus={focusBorder} onBlur={blurBorder}>
                <option value="">Select a sector…</option>
                {CERTIFICATION_SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>Phone Number</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
            {acctMsg && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 14px", borderRadius: 8, background: acctMsg.ok ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${acctMsg.ok ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}` }}>
                <CheckCircle2 size={14} color={acctMsg.ok ? "#22c55e" : "#ef4444"} />
                <span style={{ fontSize: 13, fontFamily: "var(--font-body)", color: acctMsg.ok ? "#22c55e" : "#ef4444" }}>{acctMsg.text}</span>
              </div>
            )}
            <button type="submit" disabled={acctSaving} className="btn-primary" style={{ opacity: acctSaving ? 0.6 : 1, cursor: acctSaving ? "not-allowed" : "pointer" }}>
              {acctSaving ? <><Loader2 size={14} style={{ animation: "rotateSeal 1s linear infinite" }} /> Saving…</> : "Save Account"}
            </button>
          </form>
        </GlowingCard>
      )}

      {/* ── Security Tab ── */}
      {tab === "security" && (
        <GlowingCard style={{ padding: "28px 30px", maxWidth: 520 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "#0A1535", marginBottom: 6 }}>Change Password</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.5)", marginBottom: 24 }}>Use a strong password you don't use elsewhere.</p>
          <form onSubmit={savePassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={label}>Current Password *</label>
              <input required type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
            <div>
              <label style={label}>New Password *</label>
              <input required type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} style={inputStyle} placeholder="Min. 8 characters" onFocus={focusBorder} onBlur={blurBorder} />
            </div>
            <div>
              <label style={label}>Confirm New Password *</label>
              <input required type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
            {pwdMsg && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 14px", borderRadius: 8, background: pwdMsg.ok ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${pwdMsg.ok ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}` }}>
                <CheckCircle2 size={14} color={pwdMsg.ok ? "#22c55e" : "#ef4444"} />
                <span style={{ fontSize: 13, fontFamily: "var(--font-body)", color: pwdMsg.ok ? "#22c55e" : "#ef4444" }}>{pwdMsg.text}</span>
              </div>
            )}
            <button type="submit" disabled={pwdSaving} className="btn-primary" style={{ opacity: pwdSaving ? 0.6 : 1, cursor: pwdSaving ? "not-allowed" : "pointer" }}>
              {pwdSaving ? <><Loader2 size={14} style={{ animation: "rotateSeal 1s linear infinite" }} /> Updating…</> : "Update Password"}
            </button>
          </form>
        </GlowingCard>
      )}

      {/* ── Danger Zone Tab ── */}
      {tab === "danger" && (
        <GlowingCard style={{ padding: "28px 30px", maxWidth: 520, border: "1px solid rgba(239,68,68,0.2)" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 20 }}>
            <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "#ef4444", marginBottom: 4 }}>Delete Account</h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.55)", lineHeight: 1.6 }}>
                Deleting your account will permanently remove all your data, enrollments, certificates, and applications. This action cannot be undone.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ ...label, color: "#ef4444" }}>Type your email address to confirm</label>
              <input
                value={deleteConfirm}
                onChange={e => { setDeleteConfirm(e.target.value); setDeleteMsg(""); }}
                placeholder={user.email}
                style={{ ...inputStyle, borderColor: "rgba(239,68,68,0.25)" }}
                onFocus={e => (e.currentTarget.style.borderColor = "#ef4444")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)")}
              />
            </div>
            {deleteMsg && <p style={{ fontSize: 13, fontFamily: "var(--font-body)", color: deleteMsg.includes("submitted") ? "#22c55e" : "#ef4444" }}>{deleteMsg}</p>}
            <button
              onClick={deleteAccount}
              disabled={deleting || deleteConfirm !== user.email}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "11px 20px", borderRadius: 8, border: "1.5px solid rgba(239,68,68,0.5)",
                background: deleteConfirm === user.email ? "rgba(239,68,68,0.9)" : "rgba(239,68,68,0.08)",
                color: deleteConfirm === user.email ? "white" : "rgba(239,68,68,0.5)",
                fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600,
                cursor: deleteConfirm === user.email && !deleting ? "pointer" : "not-allowed",
                transition: "all 0.2s",
              }}
            >
              {deleting ? <Loader2 size={14} style={{ animation: "rotateSeal 1s linear infinite" }} /> : <AlertTriangle size={14} />}
              {deleting ? "Processing…" : "Delete My Account"}
            </button>
          </div>
        </GlowingCard>
      )}
    </div>
  );
}
