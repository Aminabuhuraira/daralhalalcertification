"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Send, Pencil } from "lucide-react";
import DocumentUpload from "@/components/dashboard/DocumentUpload";
import { SCHEME_CODES } from "@/lib/sectors";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px",
  background: "rgba(10,21,53,0.02)",
  border: "1px solid rgba(10,21,53,0.12)",
  borderRadius: 8,
  fontFamily: "var(--font-body)", fontSize: 13.5, color: "#0A1535",
  outline: "none", transition: "border-color 0.2s",
  boxSizing: "border-box",
};

const SCALES = [
  { value: "LARGE",  label: "Large Scale",  desc: "High-volume industrial / national distribution" },
  { value: "MEDIUM", label: "Medium Scale", desc: "Regional distribution, mid-tier production" },
  { value: "SMALL",  label: "Small Scale",  desc: "Local or startup, limited production" },
];

type Props = {
  app: {
    id: string;
    businessName: string;
    sector: string | null;
    schemeCode: string | null;
    productionScale: string | null;
    productList: string;
    notes: string | null;
    documents: string | null;
  };
};

export default function DraftApplicationEditor({ app }: Props) {
  const router = useRouter();
  const [businessName,    setBusinessName]    = useState(app.businessName);
  const [schemeCode,      setSchemeCode]      = useState(app.schemeCode ?? "");
  const [productionScale, setProductionScale] = useState(app.productionScale ?? "");
  const [productList,     setProductList]     = useState(app.productList);
  const [notes,           setNotes]           = useState(app.notes ?? "");
  const [saving,          setSaving]          = useState(false);
  const [submitting,      setSubmitting]      = useState(false);
  const [message,         setMessage]         = useState("");

  const selectedScheme = SCHEME_CODES.find(s => s.code === schemeCode);
  const isValid = businessName.trim() && schemeCode && productionScale && productList.trim();

  const saveDraft = async () => {
    setSaving(true); setMessage("");
    try {
      const res = await fetch(`/api/certification-applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          sector: selectedScheme?.label ?? schemeCode,
          schemeCode: schemeCode || undefined,
          productionScale: productionScale || undefined,
          productList: productList.trim(),
          notes: notes.trim() || undefined,
        }),
      });
      if (!res.ok) { setMessage("Could not save. Please try again."); return; }
      setMessage("Draft saved.");
      router.refresh();
    } catch {
      setMessage("Network error.");
    } finally {
      setSaving(false);
    }
  };

  const submitApplication = async () => {
    if (!isValid) return;
    // First save latest edits, then submit
    setSubmitting(true); setMessage("");
    try {
      // Save edits
      await fetch(`/api/certification-applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          sector: selectedScheme?.label ?? schemeCode,
          schemeCode: schemeCode || undefined,
          productionScale: productionScale || undefined,
          productList: productList.trim(),
          notes: notes.trim() || undefined,
        }),
      });
      // Then submit
      const res = await fetch(`/api/certification-applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit" }),
      });
      if (!res.ok) { setMessage("Could not submit. Please try again."); setSubmitting(false); return; }
      router.refresh();
    } catch {
      setMessage("Network error.");
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Draft banner */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: "rgba(107,114,128,0.06)", border: "1px solid rgba(107,114,128,0.2)", marginBottom: 16 }}>
        <Pencil size={14} color="#6B7280" />
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.6)" }}>
          Complete your application details below. You can save a draft at any time and upload documents before submitting.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Business Name */}
        <div>
          <label style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "rgba(10,21,53,0.45)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>Business / Brand Name *</label>
          <input value={businessName} onChange={e => setBusinessName(e.target.value)} style={inputStyle} placeholder="e.g. Halal Foods Nigeria Ltd" />
        </div>

        {/* Certification Scheme */}
        <div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "rgba(10,21,53,0.45)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Certification Scheme *</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 7 }}>
            {SCHEME_CODES.map(s => {
              const selected = schemeCode === s.code;
              return (
                <button key={s.code} type="button" onClick={() => setSchemeCode(s.code)} style={{
                  padding: "10px 12px", borderRadius: 8, cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                  border: selected ? "2px solid #C9A227" : "2px solid rgba(109,40,217,0.15)",
                  background: selected ? "rgba(201,162,39,0.06)" : "rgba(109,40,217,0.02)",
                }}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, color: selected ? "#9a7810" : "#6D28D9", letterSpacing: "0.05em", display: "block", marginBottom: 1 }}>{s.code}</span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: selected ? "#0A1535" : "rgba(10,21,53,0.55)", lineHeight: 1.3, display: "block" }}>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Production Scale */}
        <div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "rgba(10,21,53,0.45)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Production Scale *</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {SCALES.map(s => {
              const selected = productionScale === s.value;
              return (
                <button key={s.value} type="button" onClick={() => setProductionScale(s.value)} style={{
                  padding: "12px 10px", borderRadius: 10, cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                  border: selected ? "2px solid #C9A227" : "2px solid rgba(109,40,217,0.15)",
                  background: selected ? "rgba(201,162,39,0.06)" : "rgba(109,40,217,0.02)",
                }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: selected ? "#C9A227" : "#0A1535", marginBottom: 3 }}>{s.label}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(10,21,53,0.4)", lineHeight: 1.4 }}>{s.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Products */}
        <div>
          <label style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "rgba(10,21,53,0.45)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>Products / Services to Certify *</label>
          <textarea rows={4} value={productList} onChange={e => setProductList(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} placeholder="List each product or service (one per line)" />
        </div>

        {/* Notes */}
        <div>
          <label style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "rgba(10,21,53,0.45)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>Additional Notes</label>
          <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} placeholder="Any additional information for the DAHC review team (optional)" />
        </div>

        {/* Document upload */}
        <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(109,40,217,0.03)", border: "1px solid rgba(109,40,217,0.1)" }}>
          <DocumentUpload
            appId={app.id}
            initialDocs={app.documents ? JSON.parse(app.documents) : []}
            label="Supporting Documents (trade licence, ingredient lists, NAFDAC certs, etc.)"
          />
        </div>

        {message && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: message === "Draft saved." ? "#16A34A" : "#DC2626" }}>{message}</p>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={saveDraft}
            disabled={saving || submitting}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
              padding: "10px 18px", borderRadius: 8, cursor: "pointer",
              background: "transparent", border: "1px solid rgba(10,21,53,0.2)",
              color: "rgba(10,21,53,0.65)", opacity: saving ? 0.6 : 1, transition: "all 0.15s",
            }}
          >
            <Save size={13} /> {saving ? "Saving…" : "Save Draft"}
          </button>
          <button
            onClick={submitApplication}
            disabled={!isValid || submitting || saving}
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: 7, opacity: (!isValid || submitting) ? 0.6 : 1, cursor: !isValid || submitting ? "not-allowed" : "pointer" }}
          >
            <Send size={13} /> {submitting ? "Submitting…" : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
}
