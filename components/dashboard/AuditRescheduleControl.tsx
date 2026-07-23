"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Loader2 } from "lucide-react";

const RESCHEDULE_CUTOFF_DAYS = 3;

export default function AuditRescheduleControl({ appId, auditDate }: { appId: string; auditDate: string | Date }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const msUntilAudit = new Date(auditDate).getTime() - Date.now();
  const daysUntilAudit = Math.floor(msUntilAudit / (24 * 60 * 60 * 1000));
  const canReschedule = daysUntilAudit > RESCHEDULE_CUTOFF_DAYS;

  const submit = async () => {
    if (!newDate) return;
    setSaving(true); setMessage(null);
    try {
      const res = await fetch(`/api/certification-applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rescheduleAudit", newAuditDate: newDate }),
      });
      const data = await res.json();
      if (!res.ok) { setMessage({ ok: false, text: data.error || "Failed to reschedule." }); setSaving(false); return; }
      setMessage({ ok: true, text: "Audit rescheduled — check your email for confirmation." });
      setOpen(false);
      router.refresh();
    } catch {
      setMessage({ ok: false, text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (!canReschedule) {
    return (
      <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.6)", marginTop: 8 }}>
        This audit is within {RESCHEDULE_CUTOFF_DAYS} days — it can no longer be self-rescheduled. To change it, contact{" "}
        <a href="mailto:inspection@daralhalalcertification.com" style={{ color: "#6D28D9" }}>inspection@daralhalalcertification.com</a>.
      </p>
    );
  }

  return (
    <div style={{ marginTop: 8 }}>
      {message && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: message.ok ? "#16A34A" : "#DC2626", marginBottom: 8 }}>{message.text}</p>
      )}
      {open ? (
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="date"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)}
            style={{ padding: "7px 9px", borderRadius: 6, border: "1px solid rgba(10,21,53,0.15)", fontFamily: "var(--font-body)", fontSize: 12.5, background: "white", color: "#0A1535" }}
          />
          <button
            onClick={submit}
            disabled={saving || !newDate}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 6, border: "none", background: "#0D9488", color: "white", fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 700, cursor: saving || !newDate ? "not-allowed" : "pointer", opacity: saving || !newDate ? 0.6 : 1 }}
          >
            {saving ? <Loader2 size={12} style={{ animation: "rotateSeal 1s linear infinite" }} /> : "Confirm New Date"}
          </button>
          <button
            onClick={() => { setOpen(false); setNewDate(""); }}
            style={{ padding: "7px 12px", borderRadius: 6, border: "1px solid rgba(10,21,53,0.15)", background: "white", color: "rgba(10,21,53,0.6)", fontFamily: "var(--font-body)", fontSize: 12.5, cursor: "pointer" }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 700, color: "#0D9488", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <CalendarClock size={13} /> Request a Different Date
        </button>
      )}
    </div>
  );
}
