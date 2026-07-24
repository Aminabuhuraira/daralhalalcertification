"use client";
import { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, ClipboardList, ArrowRight, Save, Loader2 } from "lucide-react";

type ChecklistItem = {
  id: string;
  section: string;
  label: string;
  required: boolean;
  status: "present" | "missing" | "na";
  notes: string;
};

// Mirrors AP_HALAL CERTIFICATION APPLICATION CHECKLIST_Closed_17Dec25.pdf item-for-item.
const INITIAL_CHECKLIST: Omit<ChecklistItem, "status" | "notes">[] = [
  // A. Company Information
  { id: "A1", section: "A. Company Information", label: "Completed Application Form (signed & stamped)", required: true },
  { id: "A2", section: "A. Company Information", label: "Copy of Business Registration / License", required: true },
  { id: "A3", section: "A. Company Information", label: "Company Profile & Organization Chart", required: true },
  { id: "A4", section: "A. Company Information", label: "Factory / Premises Address & Contact Details", required: true },
  // B. Person in Charge (PIC)
  { id: "B1", section: "B. Person in Charge (PIC)", label: "Appointment Letter / Authorization of PIC", required: true },
  { id: "B2", section: "B. Person in Charge (PIC)", label: "PIC's Contact Details (phone & email)", required: true },
  // C. Halal Certification Scheme
  { id: "C1", section: "C. Halal Certification Scheme", label: "Selection of Relevant Halal Certification Scheme(s)", required: true },
  // D. Products
  { id: "D1", section: "D. Products", label: "List of Products (name, brand, category/HS code)", required: true },
  { id: "D2", section: "D. Products", label: "Product Labels / Packaging Samples (if available)", required: false },
  // E. Ingredients & Materials
  { id: "E1", section: "E. Ingredients & Materials", label: "List of Ingredients & Raw Materials", required: true },
  { id: "E2", section: "E. Ingredients & Materials", label: "Halal Certificates from Recognized CBs", required: true },
  { id: "E3", section: "E. Ingredients & Materials", label: "Supplier Declarations (if no Halal Cert available)", required: false },
  { id: "E4", section: "E. Ingredients & Materials", label: "Certificates of Analysis (CoA) / MSDS (if applicable)", required: false },
  { id: "E5", section: "E. Ingredients & Materials", label: "Laboratory Reports (if applicable)", required: false },
  { id: "E6", section: "E. Ingredients & Materials", label: "Validity Dates of Supporting Documents", required: true },
  // F. Halal Assurance System (HAS)
  { id: "F1", section: "F. Halal Assurance System (HAS)", label: "Halal Policy Statement", required: true },
  { id: "F2", section: "F. Halal Assurance System (HAS)", label: "Internal Halal Committee Details", required: true },
  { id: "F3", section: "F. Halal Assurance System (HAS)", label: "Halal Assurance / Monitoring Procedures", required: true },
  // G. Other Certifications
  { id: "G1", section: "G. Other Certifications", label: "ISO 22000 / HACCP Certificate (if available)", required: false },
  { id: "G2", section: "G. Other Certifications", label: "GMP (Must Have)", required: true },
  { id: "G3", section: "G. Other Certifications", label: "ISO 9001 / Other QMS Certificates (Good to Have)", required: false },
  // H. Fee Payment
  { id: "H1", section: "H. Fee Payment", label: "Proof of Application Fee Payment", required: true },
  // I. Declaration
  { id: "I1", section: "I. Declaration", label: "Signed Declaration by Authorized Representative", required: true },
];

function buildInitial(savedJson: string | null): ChecklistItem[] {
  if (savedJson) {
    try {
      const saved = JSON.parse(savedJson) as Record<string, Omit<ChecklistItem, "id" | "section" | "label" | "required">>;
      return INITIAL_CHECKLIST.map(item => ({
        ...item,
        status: saved[item.id]?.status ?? "missing",
        notes:  saved[item.id]?.notes  ?? "",
      }));
    } catch { /* fall through */ }
  }
  return INITIAL_CHECKLIST.map(item => ({ ...item, status: "missing" as const, notes: "" }));
}

const inputStyle: React.CSSProperties = {
  padding: "6px 10px", background: "#fafafa", border: "1px solid rgba(10,21,53,0.1)",
  borderRadius: 5, fontFamily: "var(--font-body)", fontSize: 12, color: "#0A1535",
  outline: "none", width: "100%", boxSizing: "border-box",
};

type Props = {
  appId: string;
  initialChecklistData: string | null;
  onUpdate: (patch: { status?: string; checklistData?: string; deficiencyItems?: string; deficiencyNotes?: string }) => void;
};

export default function AdminScreeningChecklist({ appId, initialChecklistData, onUpdate }: Props) {
  const [items,   setItems]   = useState<ChecklistItem[]>(() => buildInitial(initialChecklistData));
  const [saving,  setSaving]  = useState(false);
  const [message, setMessage] = useState("");

  const presentCount  = items.filter(i => i.status === "present").length;
  const missingCount  = items.filter(i => i.status === "missing" && i.required).length;
  const totalRequired = items.filter(i => i.required).length;
  const allRequiredPresent = missingCount === 0;

  const grouped = items.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  const toggle = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const next: ChecklistItem["status"] = item.status === "present" ? "missing" : item.status === "missing" ? "na" : "present";
      return { ...item, status: next };
    }));
  };

  const updateNotes = (id: string, notes: string) =>
    setItems(prev => prev.map(item => item.id === id ? { ...item, notes } : item));

  const buildChecklistData = () => {
    const map: Record<string, { status: string; notes: string }> = {};
    items.forEach(item => { map[item.id] = { status: item.status, notes: item.notes }; });
    return JSON.stringify(map);
  };

  const patch = async (body: Record<string, unknown>) => {
    setSaving(true); setMessage("");
    try {
      const res = await fetch(`/api/certification-applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setMessage(data.error || "Error saving."); return; }
      onUpdate(body as { status?: string; checklistData?: string; deficiencyItems?: string; deficiencyNotes?: string });
      setMessage("Saved.");
    } catch {
      setMessage("Network error.");
    } finally {
      setSaving(false);
    }
  };

  const saveChecklist = () => patch({ checklistData: buildChecklistData() });

  const issueDeficiencyNotice = () => {
    const missing = items.filter(i => i.status === "missing" && i.required);
    const missingNames = missing.map(m => `• ${m.id}: ${m.label}`).join("\n");
    const deficiencyNotes = `DAHC Administrative Screening — Deficiency Notice\n\nThe following required documents were not submitted or are incomplete:\n\n${missingNames}\n\nPlease upload the above documents within 14 working days to avoid closure of your application.`;
    const deficiencyItems = JSON.stringify(missing.map(m => ({ id: m.id, label: m.label })));
    patch({
      status:          "DEFICIENCY_NOTICE",
      checklistData:   buildChecklistData(),
      deficiencyItems,
      deficiencyNotes,
    });
  };

  const proceedToEligibility = () => {
    patch({
      status:        "ELIGIBILITY_REVIEW",
      checklistData: buildChecklistData(),
      reviewNotes:   "Administrative screening complete. All required documents verified. Application proceeding to eligibility review.",
    });
  };

  return (
    <div style={{ background: "rgba(59,130,246,0.03)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
      {/* Header */}
      <div style={{ padding: "14px 18px", background: "rgba(59,130,246,0.06)", borderBottom: "1px solid rgba(59,130,246,0.12)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <ClipboardList size={16} color="#2563EB" />
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "#1D4ED8" }}>
          Administrative Screening Checklist
        </p>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "#16A34A" }}>
            {presentCount} Present
          </span>
          <span style={{ padding: "3px 10px", borderRadius: 20, background: missingCount > 0 ? "rgba(239,68,68,0.08)" : "rgba(107,114,128,0.08)", border: `1px solid ${missingCount > 0 ? "rgba(239,68,68,0.3)" : "rgba(107,114,128,0.2)"}`, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: missingCount > 0 ? "#DC2626" : "#6B7280" }}>
            {missingCount} Missing (Required)
          </span>
          <span style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(10,21,53,0.05)", border: "1px solid rgba(10,21,53,0.12)", fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(10,21,53,0.68)" }}>
            {totalRequired} Required Items
          </span>
        </div>
      </div>

      {/* Checklist items */}
      <div style={{ padding: "16px 18px" }}>
        {Object.entries(grouped).map(([section, sectionItems]) => (
          <div key={section} style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "#1D4ED8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid rgba(59,130,246,0.12)" }}>
              {section}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sectionItems.map(item => {
                const isPresent = item.status === "present";
                const isNA      = item.status === "na";
                return (
                  <div key={item.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 8, background: isPresent ? "rgba(34,197,94,0.04)" : isNA ? "rgba(107,114,128,0.04)" : "white", border: `1px solid ${isPresent ? "rgba(34,197,94,0.2)" : isNA ? "rgba(107,114,128,0.15)" : "rgba(10,21,53,0.08)"}`, transition: "all 0.15s" }}>
                    {/* Toggle button */}
                    <button
                      onClick={() => toggle(item.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0, marginTop: 1 }}
                      title={isPresent ? "Mark as Missing" : isNA ? "Mark as Present" : "Mark as N/A"}
                    >
                      {isPresent ? (
                        <CheckCircle2 size={18} color="#16A34A" />
                      ) : isNA ? (
                        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(107,114,128,0.15)", border: "2px solid rgba(107,114,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: "#6B7280" }}>N/A</span>
                        </div>
                      ) : (
                        <XCircle size={18} color={item.required ? "#EF4444" : "#D1D5DB"} />
                      )}
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "rgba(10,21,53,0.64)", letterSpacing: "0.04em" }}>{item.id}</span>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: isPresent ? "#0A1535" : "rgba(10,21,53,0.7)", fontWeight: isPresent ? 500 : 400, flex: 1 }}>
                          {item.label}
                        </p>
                        {item.required && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#EF4444", flexShrink: 0 }}>REQ</span>
                        )}
                      </div>
                      {/* Notes input */}
                      <input
                        value={item.notes}
                        onChange={e => updateNotes(item.id, e.target.value)}
                        placeholder="Reviewer notes (optional)…"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Actions */}
        {message && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: message === "Saved." ? "#16A34A" : "#DC2626", marginBottom: 12 }}>{message}</p>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 12, borderTop: "1px solid rgba(10,21,53,0.07)" }}>
          <button onClick={saveChecklist} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, padding: "8px 16px", borderRadius: 6, border: "1px solid rgba(10,21,53,0.2)", background: "white", color: "rgba(10,21,53,0.78)", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
            {saving ? <Loader2 size={12} style={{ animation: "rotateSeal 1s linear infinite" }} /> : <Save size={12} />}
            Save Checklist
          </button>

          {!allRequiredPresent && (
            <button
              onClick={issueDeficiencyNotice}
              disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 700, padding: "8px 16px", borderRadius: 6, border: "1px solid rgba(245,158,11,0.4)", background: "rgba(245,158,11,0.08)", color: "#D97706", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}
            >
              <AlertTriangle size={12} />
              Issue Deficiency Notice ({missingCount} item{missingCount !== 1 ? "s" : ""} missing)
            </button>
          )}

          {allRequiredPresent && (
            <button
              onClick={proceedToEligibility}
              disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 700, padding: "8px 16px", borderRadius: 6, border: "1px solid rgba(22,163,74,0.4)", background: "rgba(22,163,74,0.08)", color: "#16A34A", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}
            >
              <ArrowRight size={12} />
              All Documents Complete — Proceed to Eligibility Review
            </button>
          )}
        </div>

        <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(10,21,53,0.62)", marginTop: 10 }}>
          Click an item icon to toggle: ✓ Present → ✗ Missing → N/A → ✓. Click &quot;Save Checklist&quot; to persist progress without advancing status.
        </p>
      </div>
    </div>
  );
}
