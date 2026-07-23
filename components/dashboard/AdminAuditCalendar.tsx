"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CalendarClock, Loader2, CalendarPlus } from "lucide-react";

type ScheduledAudit = {
  id: string;
  businessName: string;
  status: string;
  auditDate: string;
  auditTeam: string | null;
  schemeCode: string | null;
  applicationNumber: string | null;
};
type NeedsScheduling = {
  id: string;
  businessName: string;
  schemeCode: string | null;
  applicationNumber: string | null;
  createdAt: string;
};

const STATUS_COLOR: Record<string, string> = {
  PENDING_AUDIT: "#14B8A6",
  AUDITING: "#0891B2",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function AdminAuditCalendar({
  scheduled,
  needsScheduling,
}: {
  scheduled: ScheduledAudit[];
  needsScheduling: NeedsScheduling[];
}) {
  const router = useRouter();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dateInput, setDateInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const byDay = useMemo(() => {
    const map = new Map<string, ScheduledAudit[]>();
    for (const a of scheduled) {
      const k = dateKey(new Date(a.auditDate));
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(a);
    }
    return map;
  }, [scheduled]);

  const cells = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const changeMonth = (delta: number) => {
    let m = viewMonth + delta, y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m); setViewYear(y);
  };

  const setAuditDate = async (appId: string) => {
    if (!dateInput) return;
    setSaving(true); setMessage("");
    try {
      const res = await fetch(`/api/certification-applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditDate: dateInput }),
      });
      const data = await res.json();
      if (!res.ok) { setMessage(data.error || "Failed to save."); setSaving(false); return; }
      setMessage("Audit date saved — applicant notified by email.");
      setEditingId(null);
      setDateInput("");
      router.refresh();
    } catch {
      setMessage("Network error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }} className="admin-pipeline-grid">
      {/* ── Month calendar ── */}
      <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid rgba(10,21,53,0.08)", padding: "22px 24px", boxShadow: "0 1px 4px rgba(10,21,53,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#0A1535", margin: 0 }}>{monthLabel}</p>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => changeMonth(-1)} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid rgba(10,21,53,0.12)", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronLeft size={15} color="#0A1535" />
            </button>
            <button onClick={() => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); }} style={{ padding: "0 12px", height: 30, borderRadius: 7, border: "1px solid rgba(10,21,53,0.12)", background: "white", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: "rgba(10,21,53,0.7)" }}>
              Today
            </button>
            <button onClick={() => changeMonth(1)} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid rgba(10,21,53,0.12)", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronRight size={15} color="#0A1535" />
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
          {WEEKDAYS.map(d => (
            <div key={d} style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "rgba(10,21,53,0.45)", textTransform: "uppercase", letterSpacing: "0.04em", padding: "4px 0" }}>
              {d}
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} style={{ minHeight: 84 }} />;
            const isToday = dateKey(d) === dateKey(today);
            const dayAudits = byDay.get(dateKey(d)) ?? [];
            return (
              <div key={i} style={{
                minHeight: 84, borderRadius: 8, padding: "6px 6px",
                background: isToday ? "rgba(201,162,39,0.06)" : "rgba(10,21,53,0.015)",
                border: isToday ? "1px solid rgba(201,162,39,0.35)" : "1px solid rgba(10,21,53,0.06)",
                display: "flex", flexDirection: "column", gap: 3,
              }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: isToday ? 800 : 600, color: isToday ? "#9a7810" : "rgba(10,21,53,0.55)" }}>{d.getDate()}</span>
                {dayAudits.slice(0, 3).map(a => (
                  <div key={a.id} title={`${a.businessName}${a.auditTeam ? ` — ${a.auditTeam}` : ""}`} style={{
                    fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, color: "white",
                    background: STATUS_COLOR[a.status] ?? "#94A3B8", borderRadius: 4, padding: "2px 5px",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {a.businessName}
                  </div>
                ))}
                {dayAudits.length > 3 && (
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 9.5, color: "rgba(10,21,53,0.5)" }}>+{dayAudits.length - 3} more</span>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(10,21,53,0.06)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 11.5, color: "rgba(10,21,53,0.65)" }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: STATUS_COLOR.PENDING_AUDIT }} /> Audit Scheduled
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 11.5, color: "rgba(10,21,53,0.65)" }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: STATUS_COLOR.AUDITING }} /> Audit In Progress
          </span>
        </div>
      </div>

      {/* ── Needs scheduling queue ── */}
      <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid rgba(10,21,53,0.08)", padding: "22px 24px", boxShadow: "0 1px 4px rgba(10,21,53,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <CalendarClock size={16} color="#F59E0B" />
          <p style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "#0A1535", margin: 0 }}>
            Needs Scheduling ({needsScheduling.length})
          </p>
        </div>

        {message && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: message.includes("saved") ? "#16A34A" : "#DC2626", marginBottom: 12 }}>{message}</p>
        )}

        {needsScheduling.length === 0 ? (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.6)" }}>
            Every application awaiting audit has a date set.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {needsScheduling.map(app => (
              <div key={app.id} style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "#0A1535", margin: "0 0 2px" }}>{app.businessName}</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "rgba(10,21,53,0.6)", margin: "0 0 8px" }}>
                  {app.applicationNumber ?? app.id.slice(0, 8)}{app.schemeCode ? ` · ${app.schemeCode}` : ""} · payment confirmed {new Date(app.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </p>
                {editingId === app.id ? (
                  <div style={{ display: "flex", gap: 6 }}>
                    <input type="date" value={dateInput} onChange={e => setDateInput(e.target.value)} style={{ flex: 1, padding: "7px 9px", borderRadius: 6, border: "1px solid rgba(10,21,53,0.15)", fontFamily: "var(--font-body)", fontSize: 12.5, background: "white", color: "#0A1535" }} />
                    <button onClick={() => setAuditDate(app.id)} disabled={saving || !dateInput} style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 12px", borderRadius: 6, border: "none", background: "#0A1535", color: "#C9A227", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving || !dateInput ? 0.6 : 1 }}>
                      {saving ? <Loader2 size={12} style={{ animation: "rotateSeal 1s linear infinite" }} /> : "Set"}
                    </button>
                    <button onClick={() => { setEditingId(null); setDateInput(""); }} style={{ padding: "7px 10px", borderRadius: 6, border: "1px solid rgba(10,21,53,0.15)", background: "white", color: "rgba(10,21,53,0.6)", fontFamily: "var(--font-body)", fontSize: 12, cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setEditingId(app.id); setDateInput(""); setMessage(""); }} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 700, color: "#D97706", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    <CalendarPlus size={13} /> Set Audit Date
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
