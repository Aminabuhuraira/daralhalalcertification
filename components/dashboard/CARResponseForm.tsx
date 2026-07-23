"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Plus, Trash2, Send, Loader2 } from "lucide-react";

type NCRSeverity = "MINOR" | "MAJOR" | "SERIOUS";

type CorrectionRow = {
  action: string;
  responsible: string;
  targetDate: string;
  evidence: string;
};

type CARData = {
  rootCause: string;
  actions: CorrectionRow[];
  submittedAt: string;
};

type Props = {
  appId: string;
  ncrReport: string | null;
  ncSeverity: string | null;
  existingCarResponse: string | null;
};

const SEVERITY_META: Record<NCRSeverity, { label: string; color: string; bg: string; border: string }> = {
  MINOR:   { label: "Minor NC",   color: "#D97706", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.3)" },
  MAJOR:   { label: "Major NC",   color: "#EA580C", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.3)" },
  SERIOUS: { label: "Serious NC", color: "#DC2626", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.3)" },
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px",
  background: "#fafafa", border: "1px solid rgba(10,21,53,0.12)",
  borderRadius: 6, fontFamily: "var(--font-body)", fontSize: 13, color: "#0A1535",
  outline: "none", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700,
  color: "rgba(10,21,53,0.66)", textTransform: "uppercase", letterSpacing: "0.06em",
  display: "block", marginBottom: 5,
};

const emptyRow = (): CorrectionRow => ({ action: "", responsible: "", targetDate: "", evidence: "" });

export default function CARResponseForm({ appId, ncrReport, ncSeverity, existingCarResponse }: Props) {
  const router = useRouter();

  const existing: CARData | null = existingCarResponse ? (() => {
    try { return JSON.parse(existingCarResponse) as CARData; } catch { return null; }
  })() : null;

  const [rootCause, setRootCause] = useState(existing?.rootCause ?? "");
  const [actions,   setActions]   = useState<CorrectionRow[]>(existing?.actions?.length ? existing.actions : [emptyRow()]);
  const [submitting, setSubmitting] = useState(false);
  const [message,   setMessage]   = useState("");
  const isSubmitted = !!existing;

  const severity = (ncSeverity as NCRSeverity | null);
  const severityMeta = severity ? SEVERITY_META[severity] ?? null : null;

  const addRow = () => setActions(prev => [...prev, emptyRow()]);
  const removeRow = (i: number) => setActions(prev => prev.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: keyof CorrectionRow, val: string) =>
    setActions(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  const isValid = rootCause.trim().length > 10 && actions.every(r => r.action.trim() && r.responsible.trim() && r.targetDate);

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true); setMessage("");
    const carData: CARData = { rootCause: rootCause.trim(), actions, submittedAt: new Date().toISOString() };
    try {
      const res = await fetch(`/api/certification-applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submitCarResponse", carResponse: JSON.stringify(carData) }),
      });
      if (!res.ok) {
        const d = await res.json();
        setMessage(d.error || "Submission failed. Please try again.");
        return;
      }
      router.refresh();
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "white", borderRadius: 12, border: "1px solid rgba(249,115,22,0.25)", overflow: "hidden", marginBottom: 12 }}>
      {/* Header */}
      <div style={{ padding: "14px 18px", background: "rgba(249,115,22,0.06)", borderBottom: "1px solid rgba(249,115,22,0.15)", display: "flex", alignItems: "center", gap: 10 }}>
        <AlertTriangle size={16} color="#EA580C" />
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "#C2410C" }}>
          Corrective Action Response (CAR) — QMS/AU/CAR/01
        </p>
        {severityMeta && (
          <span style={{ marginLeft: "auto", padding: "2px 10px", borderRadius: 5, background: severityMeta.bg, border: `1px solid ${severityMeta.border}`, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: severityMeta.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {severityMeta.label}
          </span>
        )}
      </div>

      <div style={{ padding: "18px 20px" }}>
        {/* Section A: NCR Report */}
        {ncrReport && (
          <div style={{ marginBottom: 20 }}>
            <p style={labelStyle}>Section A — Non-Conformance Report (Issued by DAHC Inspector)</p>
            <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(249,115,22,0.04)", border: "1px solid rgba(249,115,22,0.15)" }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.78)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{ncrReport}</p>
            </div>
          </div>
        )}

        {isSubmitted ? (
          /* Submitted read-only view */
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.25)", marginBottom: 18 }}>
              <CheckCircle2 size={16} color="#16A34A" />
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "#16A34A" }}>
                CAR submitted on {new Date(existing!.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} — under DAHC review
              </p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <p style={labelStyle}>Section B — Root Cause Analysis</p>
              <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(10,21,53,0.02)", border: "1px solid rgba(10,21,53,0.07)" }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.78)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{existing!.rootCause}</p>
              </div>
            </div>

            <div>
              <p style={labelStyle}>Section C — Corrective Action Plan</p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, fontFamily: "var(--font-body)" }}>
                  <thead>
                    <tr style={{ background: "#f0f4f8" }}>
                      <th style={{ padding: "8px 10px", textAlign: "left", fontWeight: 700, color: "rgba(10,21,53,0.68)", textTransform: "uppercase", fontSize: 10, letterSpacing: "0.05em" }}>Corrective Action</th>
                      <th style={{ padding: "8px 10px", textAlign: "left", fontWeight: 700, color: "rgba(10,21,53,0.68)", textTransform: "uppercase", fontSize: 10, letterSpacing: "0.05em" }}>Responsible Person</th>
                      <th style={{ padding: "8px 10px", textAlign: "left", fontWeight: 700, color: "rgba(10,21,53,0.68)", textTransform: "uppercase", fontSize: 10, letterSpacing: "0.05em" }}>Target Date</th>
                      <th style={{ padding: "8px 10px", textAlign: "left", fontWeight: 700, color: "rgba(10,21,53,0.68)", textTransform: "uppercase", fontSize: 10, letterSpacing: "0.05em" }}>Evidence of Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {existing!.actions.map((row, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(10,21,53,0.06)", verticalAlign: "top" }}>
                        <td style={{ padding: "8px 10px", color: "rgba(10,21,53,0.78)" }}>{row.action}</td>
                        <td style={{ padding: "8px 10px", color: "rgba(10,21,53,0.78)" }}>{row.responsible}</td>
                        <td style={{ padding: "8px 10px", color: "rgba(10,21,53,0.78)", whiteSpace: "nowrap" }}>{row.targetDate}</td>
                        <td style={{ padding: "8px 10px", color: "rgba(10,21,53,0.78)" }}>{row.evidence || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* Editable form */
          <>
            {/* Section B: Root Cause */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Section B — Root Cause Analysis *</label>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.66)", marginBottom: 8 }}>
                Describe the root cause(s) of the non-conformance(s) identified in the NCR. Be specific and comprehensive.
              </p>
              <textarea
                value={rootCause}
                onChange={e => setRootCause(e.target.value)}
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
                placeholder="e.g. The ingredient supplier changed their formulation without notifying us, resulting in a non-halal emulsifier being present in the product batch produced on 15 July 2026..."
              />
            </div>

            {/* Section C: Corrective Actions */}
            <div>
              <label style={labelStyle}>Section C — Corrective Action Plan *</label>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.66)", marginBottom: 12 }}>
                List each corrective action, the person responsible, the target completion date, and the type of evidence you will provide.
              </p>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                  <thead>
                    <tr style={{ background: "#0A1535" }}>
                      {["#", "Corrective Action", "Responsible Person", "Target Date", "Evidence Type", ""].map(h => (
                        <th key={h} style={{ padding: "9px 10px", textAlign: "left", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {actions.map((row, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(10,21,53,0.07)", background: i % 2 === 0 ? "white" : "#fafafa" }}>
                        <td style={{ padding: "8px 10px", fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.64)", textAlign: "center", width: 36 }}>{i + 1}</td>
                        <td style={{ padding: "6px 8px", minWidth: 200 }}>
                          <textarea rows={2} value={row.action} onChange={e => updateRow(i, "action", e.target.value)} style={{ ...inputStyle, resize: "none", fontSize: 12.5 }} placeholder="Describe the corrective action…" />
                        </td>
                        <td style={{ padding: "6px 8px", minWidth: 130 }}>
                          <input value={row.responsible} onChange={e => updateRow(i, "responsible", e.target.value)} style={{ ...inputStyle, fontSize: 12.5 }} placeholder="Name / Role" />
                        </td>
                        <td style={{ padding: "6px 8px", minWidth: 130 }}>
                          <input type="date" value={row.targetDate} onChange={e => updateRow(i, "targetDate", e.target.value)} style={{ ...inputStyle, fontSize: 12.5 }} />
                        </td>
                        <td style={{ padding: "6px 8px", minWidth: 150 }}>
                          <input value={row.evidence} onChange={e => updateRow(i, "evidence", e.target.value)} style={{ ...inputStyle, fontSize: 12.5 }} placeholder="Photo / Certificate / Record…" />
                        </td>
                        <td style={{ padding: "6px 8px", width: 36 }}>
                          {actions.length > 1 && (
                            <button onClick={() => removeRow(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(239,68,68,0.6)", padding: 4 }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button onClick={addRow} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, color: "#6D28D9", background: "none", border: "1px dashed rgba(109,40,217,0.3)", borderRadius: 6, padding: "7px 14px", cursor: "pointer" }}>
                <Plus size={13} /> Add Corrective Action
              </button>
            </div>

            {message && (
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "#DC2626", marginTop: 14 }}>{message}</p>
            )}

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(10,21,53,0.07)", display: "flex", gap: 10, alignItems: "center" }}>
              <button
                onClick={handleSubmit}
                disabled={!isValid || submitting}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700,
                  padding: "10px 20px", borderRadius: 8, cursor: !isValid || submitting ? "not-allowed" : "pointer",
                  background: isValid ? "#C9A227" : "rgba(10,21,53,0.1)",
                  color: isValid ? "white" : "rgba(10,21,53,0.35)",
                  border: "none", opacity: submitting ? 0.7 : 1, transition: "all 0.15s",
                }}
              >
                {submitting ? <Loader2 size={14} style={{ animation: "rotateSeal 1s linear infinite" }} /> : <Send size={13} />}
                {submitting ? "Submitting CAR…" : "Submit Corrective Action Response"}
              </button>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.64)" }}>
                Submitting will notify DAHC and advance your application to verification.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
