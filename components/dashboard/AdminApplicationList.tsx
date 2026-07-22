"use client";
import { useState, useMemo } from "react";
import { Award, Search, X, ChevronDown, ChevronUp, Bell, Calendar, Filter } from "lucide-react";
import GlowingCard from "@/components/ui/GlowingCard";
import ApplicationStages from "@/components/dashboard/ApplicationStages";
import DocumentUpload from "@/components/dashboard/DocumentUpload";
import AdminScreeningChecklist from "@/components/dashboard/AdminScreeningChecklist";

type Payment = { id: string; amount: number; currency: string; status: string };
type Certificate = { id: string; serial: string; issuedAt: string | Date };

const SCALE_LABEL: Record<string, string> = {
  LARGE: "Large Scale", MEDIUM: "Medium Scale", SMALL: "Small Scale",
};

const STATUS_DISPLAY: Record<string, string> = {
  DRAFT:               "Draft",
  SUBMITTED:           "Submitted",
  SCREENING:           "Administrative Screening",
  DEFICIENCY_NOTICE:   "Action Required",
  ELIGIBILITY_REVIEW:  "Eligibility Review",
  TRC_ESCALATION:      "TRC / Shariah Review",
  AWAITING_PAYMENT:    "Awaiting Payment",
  PENDING_AUDIT:       "Audit Scheduled",
  AUDITING:            "Audit in Progress",
  ACTION_REQUIRED_NCR: "NCR Issued",
  VERIFYING_NCR:       "Verifying NCR",
  BOARD_REVIEW:        "Board Review",
  CERTIFIED:           "Certified",
  REJECTED:            "Rejected",
  CLOSED_INCOMPLETE:   "Closed — Incomplete",
  PENDING:             "Pending",
  UNDER_REVIEW:        "Under Review",
  APPROVED:            "Approved",
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT:               "#9CA3AF",
  SUBMITTED:           "#6366F1",
  SCREENING:           "#3B82F6",
  DEFICIENCY_NOTICE:   "#F59E0B",
  ELIGIBILITY_REVIEW:  "#8B5CF6",
  TRC_ESCALATION:      "#7C3AED",
  AWAITING_PAYMENT:    "#0EA5E9",
  PENDING_AUDIT:       "#14B8A6",
  AUDITING:            "#0891B2",
  ACTION_REQUIRED_NCR: "#F97316",
  VERIFYING_NCR:       "#FB923C",
  BOARD_REVIEW:        "#84CC16",
  CERTIFIED:           "#22C55E",
  REJECTED:            "#EF4444",
  CLOSED_INCOMPLETE:   "#6B7280",
  PENDING:             "#F5C842",
  UNDER_REVIEW:        "#60A5FA",
  APPROVED:            "#22C55E",
};

const TRANSITIONS: Record<string, Array<{ to: string; label: string; color: string }>> = {
  DRAFT:               [{ to: "SUBMITTED",          label: "Submit Application",           color: "#6366F1" }],
  SUBMITTED:           [{ to: "SCREENING",           label: "Begin Screening",              color: "#3B82F6" }],
  SCREENING:           [
    { to: "DEFICIENCY_NOTICE",  label: "Issue Deficiency Notice",     color: "#F59E0B" },
    { to: "ELIGIBILITY_REVIEW", label: "Documents Complete ✓",        color: "#16A34A" },
  ],
  DEFICIENCY_NOTICE:   [
    { to: "SCREENING",          label: "Re-screen (Client Responded)", color: "#3B82F6" },
    { to: "CLOSED_INCOMPLETE",  label: "Close — No Response",          color: "#EF4444" },
  ],
  ELIGIBILITY_REVIEW:  [
    { to: "TRC_ESCALATION",     label: "Escalate to TRC",              color: "#7C3AED" },
    { to: "AWAITING_PAYMENT",   label: "Approve for Registration",     color: "#16A34A" },
    { to: "REJECTED",           label: "Reject Application",           color: "#EF4444" },
  ],
  TRC_ESCALATION:      [
    { to: "AWAITING_PAYMENT",   label: "TRC Approved",                 color: "#16A34A" },
    { to: "REJECTED",           label: "TRC Rejected",                 color: "#EF4444" },
  ],
  AWAITING_PAYMENT:    [{ to: "PENDING_AUDIT",     label: "Payment Received ✓",           color: "#16A34A" }],
  PENDING_AUDIT:       [{ to: "AUDITING",           label: "Audit Started",                color: "#0891B2" }],
  AUDITING:            [
    { to: "ACTION_REQUIRED_NCR", label: "Issue NCR (Non-Conformance)", color: "#F97316" },
    { to: "BOARD_REVIEW",        label: "No Issues — Send to Board",   color: "#16A34A" },
  ],
  ACTION_REQUIRED_NCR: [{ to: "VERIFYING_NCR",     label: "Evidence Received",            color: "#3B82F6" }],
  VERIFYING_NCR:       [
    { to: "BOARD_REVIEW",        label: "NCR Passed — Send to Board",  color: "#16A34A" },
    { to: "REJECTED",            label: "NCR Failed — Reject",         color: "#EF4444" },
  ],
  BOARD_REVIEW:        [
    { to: "CERTIFIED",           label: "Board Approved — Certify ✓",  color: "#C9A227" },
    { to: "REJECTED",            label: "Board Rejected",               color: "#EF4444" },
  ],
  CERTIFIED:           [],
  REJECTED:            [],
  CLOSED_INCOMPLETE:   [],
  PENDING:             [{ to: "SUBMITTED",          label: "Update to Submitted",          color: "#6366F1" }],
  UNDER_REVIEW:        [{ to: "SCREENING",           label: "Move to Screening",            color: "#3B82F6" }],
  APPROVED:            [{ to: "CERTIFIED",           label: "Mark as Certified",            color: "#C9A227" }],
};

type AppStatus = keyof typeof STATUS_DISPLAY;

type Application = {
  id: string;
  applicationNumber: string | null;
  businessName: string;
  sector: string;
  schemeCode: string | null;
  referenceNumber: string | null;
  productionScale: string | null;
  productList: string;
  notes: string | null;
  deficiencyNotes: string | null;
  ncrReport: string | null;
  auditDate: string | Date | null;
  documents: string | null;
  status: AppStatus;
  certIssueMode: "ON_APPROVAL" | "ON_PAYMENT" | "MANUAL";
  reviewNotes: string | null;
  createdAt: string | Date;
  user: { name: string; email: string };
  payments: Payment[];
  certificate: Certificate | null;
  // New enhanced fields
  businessRegNo: string | null;
  entityType: string | null;
  headOfficeAddress: string | null;
  telephone: string | null;
  picName: string | null;
  picDesignation: string | null;
  picPhone: string | null;
  picEmail: string | null;
  checklistData: string | null;
  deficiencyItems: string | null;
  auditTeam: string | null;
  carResponse: string | null;
  ncSeverity: string | null;
  certExpiryDate: string | null;
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px",
  background: "#fafafa",
  border: "1px solid rgba(10,21,53,0.12)",
  borderRadius: 6,
  fontFamily: "var(--font-body)", fontSize: 13, color: "#0A1535",
  outline: "none",
};

function isNew(createdAt: string | Date) {
  return Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;
}

const REVIEWER_STATES       = new Set(["SUBMITTED", "SCREENING", "DEFICIENCY_NOTICE"]);
const OPERATIONS_MGR_STATES = new Set(["ELIGIBILITY_REVIEW", "TRC_ESCALATION", "AWAITING_PAYMENT"]);
const INSPECTOR_STATES      = new Set(["PENDING_AUDIT", "AUDITING", "ACTION_REQUIRED_NCR", "VERIFYING_NCR"]);
const TECHNICAL_STATES      = new Set(["BOARD_REVIEW"]);
const SHARIA_STATES         = new Set(["BOARD_REVIEW"]);
const ADMIN_ONLY_TARGETS    = new Set(["CERTIFIED"]);

function ApplicationRow({
  app: initialApp,
  defaultOpen,
  viewerRole,
}: {
  app: Application;
  defaultOpen: boolean;
  viewerRole?: string;
}) {
  const [app,          setApp]        = useState(initialApp);
  const [open,         setOpen]       = useState(defaultOpen);
  const [reviewNotes,  setReviewNotes]= useState(app.reviewNotes ?? "");
  const [defNotes,     setDefNotes]   = useState(app.deficiencyNotes ?? "");
  const [ncrReport,    setNcrReport]  = useState(app.ncrReport ?? "");
  const [auditTeam,    setAuditTeam]  = useState(app.auditTeam ?? "");
  const [ncSeverity,   setNcSeverity] = useState(app.ncSeverity ?? "MINOR");
  const [feeAmount,    setFeeAmount]  = useState("");
  const [auditDateStr, setAuditDate]  = useState(
    app.auditDate ? new Date(app.auditDate).toISOString().slice(0, 10) : ""
  );
  const [saving,  setSaving]  = useState(false);
  const [message, setMessage] = useState("");

  const allTransitions = TRANSITIONS[app.status] ?? [];
  const transitions = allTransitions.filter(t => {
    if (!viewerRole || viewerRole === "ADMIN" || viewerRole === "SUPER_ADMIN") return true;
    if (ADMIN_ONLY_TARGETS.has(t.to) && viewerRole !== "SHARIA_PANEL") return false;
    if (viewerRole === "REVIEWER")          return REVIEWER_STATES.has(app.status);
    if (viewerRole === "OPERATIONS_MANAGER") return OPERATIONS_MGR_STATES.has(app.status);
    if (viewerRole === "INSPECTOR")         return INSPECTOR_STATES.has(app.status);
    if (viewerRole === "TECHNICAL")         return false; // read-only + notes
    if (viewerRole === "SHARIA_PANEL")      return SHARIA_STATES.has(app.status) && ["CERTIFIED", "REJECTED"].includes(t.to);
    return true;
  });

  const color   = STATUS_COLOR[app.status] ?? "#94A3B8";
  const display = STATUS_DISPLAY[app.status] ?? app.status;
  const newBadge = isNew(app.createdAt);

  const patch = async (body: Record<string, unknown>) => {
    setSaving(true); setMessage("");
    try {
      const res = await fetch(`/api/certification-applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setMessage(data.error || "Something went wrong."); return; }
      setApp(prev => ({
        ...prev,
        status:          data.application.status,
        reviewNotes:     data.application.reviewNotes,
        deficiencyNotes: data.application.deficiencyNotes,
        ncrReport:       data.application.ncrReport,
        referenceNumber: data.application.referenceNumber,
        auditDate:       data.application.auditDate,
        certificate:     data.certificate || prev.certificate,
        checklistData:   data.application.checklistData ?? prev.checklistData,
        deficiencyItems: data.application.deficiencyItems ?? prev.deficiencyItems,
        auditTeam:       data.application.auditTeam ?? prev.auditTeam,
        ncSeverity:      data.application.ncSeverity ?? prev.ncSeverity,
        certExpiryDate:  data.application.certExpiryDate ?? prev.certExpiryDate,
      }));
      setFeeAmount("");
      setMessage("Saved.");
    } catch {
      setMessage("Network error.");
    } finally {
      setSaving(false);
    }
  };

  const advanceTo = (toStatus: string) => {
    const body: Record<string, unknown> = { status: toStatus, reviewNotes };
    if (defNotes)     body.deficiencyNotes = defNotes;
    if (ncrReport)    body.ncrReport       = ncrReport;
    if (feeAmount)    { body.feeAmountNgn = Number(feeAmount); body.feeDescription = `Certification fee — ${app.businessName}`; }
    if (auditDateStr) body.auditDate       = auditDateStr;
    if (auditTeam)    body.auditTeam       = auditTeam;
    if (ncSeverity && toStatus === "ACTION_REQUIRED_NCR") body.ncSeverity = ncSeverity;
    if (toStatus === "CERTIFIED") body.issueCertificate = true;
    patch(body);
  };

  const saveNotes = () => patch({
    reviewNotes,
    deficiencyNotes: defNotes || undefined,
    ncrReport: ncrReport || undefined,
    auditTeam: auditTeam || undefined,
    ...(auditDateStr ? { auditDate: auditDateStr } : {}),
  });

  const isTechnicalReadOnly = viewerRole === "TECHNICAL";

  return (
    <GlowingCard style={{ padding: "18px 20px" }}>
      {/* Header row */}
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer", gap: 12 }}
        onClick={() => setOpen(o => !o)}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "#0A1535", margin: 0 }}>{app.businessName}</h3>
            {newBadge && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(201,162,39,0.12)", border: "1px solid rgba(201,162,39,0.3)", borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 700, color: "#9a7810", fontFamily: "var(--font-body)" }}>
                <Bell size={9} /> NEW
              </span>
            )}
            {app.applicationNumber && (
              <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#C9A227", background: "rgba(201,162,39,0.08)", padding: "1px 8px", borderRadius: 4, border: "1px solid rgba(201,162,39,0.2)" }}>
                {app.applicationNumber}
              </span>
            )}
            {app.referenceNumber && (
              <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "#6D28D9", background: "rgba(109,40,217,0.07)", padding: "1px 8px", borderRadius: 4 }}>
                {app.referenceNumber}
              </span>
            )}
            {app.certificate && (
              <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#16A34A", background: "rgba(22,163,74,0.07)", padding: "1px 8px", borderRadius: 4, border: "1px solid rgba(22,163,74,0.2)" }}>
                {app.certificate.serial}
              </span>
            )}
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.45)", margin: "4px 0 0" }}>
            {app.user.name} · {app.user.email}
            {app.schemeCode && <span style={{ marginLeft: 8, fontWeight: 600, color: "#6D28D9" }}>{app.schemeCode}</span>}
            {app.sector && <span style={{ marginLeft: 6, color: "rgba(10,21,53,0.4)" }}>· {app.sector}</span>}
            {app.productionScale && (
              <span style={{ marginLeft: 6, padding: "1px 6px", borderRadius: 3, background: "rgba(201,162,39,0.1)", color: "#9a7810", fontWeight: 700, fontSize: 10 }}>
                {SCALE_LABEL[app.productionScale] ?? app.productionScale}
              </span>
            )}
            <span style={{ marginLeft: 6, color: "rgba(10,21,53,0.3)", fontSize: 11 }}>
              · {new Date(app.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color, padding: "3px 9px", borderRadius: 5, border: `1px solid ${color}40`, background: `${color}12` }}>
            {display}
          </span>
          {open ? <ChevronUp size={15} color="rgba(10,21,53,0.4)" /> : <ChevronDown size={15} color="rgba(10,21,53,0.4)" />}
        </div>
      </div>

      {open && (
        <div style={{ marginTop: 16, borderTop: "1px solid rgba(10,21,53,0.06)", paddingTop: 16 }}>
          {/* Progress bar */}
          <div style={{ marginBottom: 14 }}>
            <ApplicationStages status={app.status} certificateIssued={!!app.certificate} />
          </div>

          {/* Company & PIC quick info */}
          {(app.businessRegNo || app.headOfficeAddress || app.picName) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12, padding: "10px 12px", borderRadius: 8, background: "rgba(10,21,53,0.02)", border: "1px solid rgba(10,21,53,0.07)" }}>
              {app.businessRegNo && <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.6)" }}><strong>Reg No:</strong> {app.businessRegNo}</p>}
              {app.entityType && <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.6)" }}><strong>Entity:</strong> {app.entityType}</p>}
              {app.headOfficeAddress && <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.6)", gridColumn: "1 / -1" }}><strong>Address:</strong> {app.headOfficeAddress}</p>}
              {app.telephone && <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.6)" }}><strong>Tel:</strong> {app.telephone}</p>}
              {app.picName && <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.6)" }}><strong>PIC:</strong> {app.picName}{app.picDesignation ? ` (${app.picDesignation})` : ""}</p>}
              {app.picPhone && <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.6)" }}><strong>PIC Phone:</strong> {app.picPhone}</p>}
              {app.picEmail && <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.6)" }}><strong>PIC Email:</strong> {app.picEmail}</p>}
            </div>
          )}

          {/* Screening checklist (SCREENING status only) */}
          {app.status === "SCREENING" && (
            <AdminScreeningChecklist
              appId={app.id}
              initialChecklistData={app.checklistData}
              onUpdate={(patch) => {
                if (patch.status) setApp(prev => ({ ...prev, status: patch.status as AppStatus }));
                if (patch.checklistData) setApp(prev => ({ ...prev, checklistData: patch.checklistData ?? prev.checklistData }));
                if (patch.deficiencyItems) setApp(prev => ({ ...prev, deficiencyItems: patch.deficiencyItems ?? prev.deficiencyItems }));
              }}
            />
          )}

          {/* Products + notes */}
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.65)", marginBottom: 8, whiteSpace: "pre-wrap" }}>
            {(() => {
              try { const arr = JSON.parse(app.productList); if (Array.isArray(arr)) return arr.map((p: { name: string; brand: string }) => `${p.name}${p.brand ? ` (${p.brand})` : ""}`).join(", "); } catch {}
              return app.productList;
            })()}
          </p>
          {app.notes && <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.45)", marginBottom: 10 }}>Client notes: {app.notes}</p>}

          {/* Audit date display */}
          {app.auditDate && (
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 12px", borderRadius: 7, background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.2)", marginBottom: 10 }}>
              <Calendar size={13} color="#0D9488" />
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "#0D9488", fontWeight: 600 }}>
                Audit: {new Date(app.auditDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          )}

          {/* NCR Report display (when set) */}
          {app.ncrReport && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.2)", marginBottom: 10 }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "#C2410C", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>NCR Report on file</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.65)", whiteSpace: "pre-wrap" }}>{app.ncrReport}</p>
            </div>
          )}

          {/* Applicant documents */}
          <div style={{ marginBottom: 14 }}>
            <DocumentUpload
              appId={app.id}
              initialDocs={app.documents ? JSON.parse(app.documents) : []}
              readOnly
              label="Applicant Documents"
            />
          </div>

          {/* Payments */}
          {app.payments.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              {app.payments.map(p => (
                <p key={p.id} style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.5)" }}>
                  {p.currency} {(p.amount / 100).toLocaleString()} — <span style={{ fontWeight: 600, color: p.status === "COMPLETED" ? "#16A34A" : "#D97706" }}>{p.status}</span>
                </p>
              ))}
            </div>
          )}

          {/* Reference numbers summary bar */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, padding: "10px 14px", borderRadius: 8, background: "rgba(10,21,53,0.025)", border: "1px solid rgba(10,21,53,0.07)" }}>
            {app.applicationNumber && (
              <span style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "rgba(10,21,53,0.55)" }}>
                App No: <strong style={{ fontFamily: "monospace", color: "#C9A227" }}>{app.applicationNumber}</strong>
              </span>
            )}
            {app.referenceNumber && (
              <span style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "rgba(10,21,53,0.55)" }}>
                DAHC Ref: <strong style={{ fontFamily: "monospace", color: "#6D28D9" }}>{app.referenceNumber}</strong>
              </span>
            )}
            {app.certificate && (
              <span style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "rgba(10,21,53,0.55)" }}>
                Certificate No: <strong style={{ fontFamily: "monospace", color: "#16A34A" }}>{app.certificate.serial}</strong>
              </span>
            )}
          </div>

          {/* Certificate */}
          {app.certificate && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14, padding: "10px 14px", borderRadius: 8, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Award size={16} color="#22C55E" />
                <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#22C55E", fontWeight: 600 }}>
                  Certificate Issued · <span style={{ fontFamily: "monospace" }}>{app.certificate.serial}</span>
                </span>
              </div>
              <a href={`/api/certificates/${app.certificate.id}/pdf`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-body)", fontSize: 12, padding: "5px 11px", borderRadius: 5, background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.25)", color: "#16A34A", textDecoration: "none", fontWeight: 600 }}>
                ↓ Certificate PDF
              </a>
            </div>
          )}

          {/* ── Staff-editable fields (hidden for TECHNICAL read-only view) ── */}
          {!isTechnicalReadOnly && (
            <>
              {/* Fee invoicing */}
              {!app.certificate && ["AWAITING_PAYMENT", "ELIGIBILITY_REVIEW", "TRC_ESCALATION", "BOARD_REVIEW"].includes(app.status) && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "rgba(10,21,53,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Invoice / Fee (NGN)</p>
                  <input value={feeAmount} onChange={e => setFeeAmount(e.target.value)} placeholder="Quote fee in NGN — leave blank to skip" type="number" min="0" style={inputStyle} />
                </div>
              )}

              {/* Audit date + team */}
              {["PENDING_AUDIT", "AUDITING"].includes(app.status) && (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "rgba(10,21,53,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>
                      <Calendar size={11} style={{ display: "inline", marginRight: 4 }} />
                      Audit Date
                    </p>
                    <input type="date" value={auditDateStr} onChange={e => setAuditDate(e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "rgba(10,21,53,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Assigned Inspection Team</p>
                    <input value={auditTeam} onChange={e => setAuditTeam(e.target.value)} placeholder="e.g. Dr. Yusuf Aliyu, Hajiya Fatima Sule" style={inputStyle} />
                  </div>
                </>
              )}

              {/* NCR Report + severity */}
              {["AUDITING", "ACTION_REQUIRED_NCR"].includes(app.status) && (
                <>
                  <div style={{ marginBottom: 10 }}>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "rgba(10,21,53,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Non-Conformance Severity</p>
                    <select value={ncSeverity} onChange={e => setNcSeverity(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                      <option value="MINOR">Minor NC (30 days to resolve)</option>
                      <option value="MAJOR">Major NC (14 days to resolve)</option>
                      <option value="SERIOUS">Serious NC (Immediate — may result in rejection)</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "rgba(10,21,53,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>NCR — Non-Conformance Report</p>
                    <textarea rows={3} value={ncrReport} onChange={e => setNcrReport(e.target.value)} placeholder="Detail the non-conformances found during the audit. This will be visible to the applicant." style={{ ...inputStyle, resize: "vertical" }} />
                  </div>
                </>
              )}

              {/* CAR response display (read-only in admin) */}
              {app.carResponse && (
                <div style={{ marginBottom: 10, padding: "10px 12px", borderRadius: 8, background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "#16A34A", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>CAR Submitted by Applicant</p>
                  {(() => {
                    try {
                      const car = JSON.parse(app.carResponse!);
                      return <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.7)" }}>Root Cause: {car.rootCause?.slice(0, 120)}{car.rootCause?.length > 120 ? "…" : ""} · {car.actions?.length ?? 0} corrective action(s)</p>;
                    } catch { return <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.5)" }}>CAR data on file.</p>; }
                  })()}
                </div>
              )}

              {/* Cert expiry date display */}
              {app.certExpiryDate && (
                <div style={{ marginBottom: 10, padding: "8px 12px", borderRadius: 7, background: "rgba(201,162,39,0.06)", border: "1px solid rgba(201,162,39,0.2)" }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "#9a7810" }}>
                    Certificate expires: <strong>{new Date(app.certExpiryDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</strong>
                  </p>
                </div>
              )}

              {/* Deficiency notes */}
              {["SCREENING", "DEFICIENCY_NOTICE"].includes(app.status) && (
                <div style={{ marginBottom: 10 }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "rgba(10,21,53,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Deficiency Notice Details</p>
                  <textarea rows={2} value={defNotes} onChange={e => setDefNotes(e.target.value)} placeholder="List missing or incomplete documents for the applicant…" style={{ ...inputStyle, resize: "vertical" }} />
                </div>
              )}

              {/* Review notes */}
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "rgba(10,21,53,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Internal Review Notes</p>
                <textarea rows={2} value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} placeholder="Internal notes (not shown to applicant)" style={{ ...inputStyle, resize: "vertical" }} />
              </div>
            </>
          )}

          {/* Technical read-only notes */}
          {isTechnicalReadOnly && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "rgba(10,21,53,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Technical Review Notes</p>
              <textarea rows={2} value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} placeholder="Add technical review comments…" style={{ ...inputStyle, resize: "vertical" }} />
            </div>
          )}

          {message && (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: message === "Saved." ? "#22c55e" : "#ef4444", marginBottom: 10 }}>{message}</p>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={saveNotes} disabled={saving} className="btn-ghost" style={{ fontSize: 12.5, padding: "8px 14px", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Saving…" : isTechnicalReadOnly ? "Save Notes" : "Save Notes"}
            </button>

            {transitions.map(t => (
              <button
                key={t.to}
                onClick={() => advanceTo(t.to)}
                disabled={saving}
                style={{
                  fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600,
                  padding: "8px 14px", borderRadius: 6,
                  background: `${t.color}12`, border: `1px solid ${t.color}40`,
                  color: t.color, cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.6 : 1, transition: "all 0.15s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </GlowingCard>
  );
}

// Filter options
const STATUS_FILTER_OPTIONS = [
  { value: "",                   label: "All Statuses" },
  { value: "SUBMITTED",          label: "Submitted" },
  { value: "SCREENING",          label: "Screening" },
  { value: "DEFICIENCY_NOTICE",  label: "Action Required" },
  { value: "ELIGIBILITY_REVIEW", label: "Eligibility Review" },
  { value: "TRC_ESCALATION",     label: "TRC Review" },
  { value: "AWAITING_PAYMENT",   label: "Awaiting Payment" },
  { value: "PENDING_AUDIT",      label: "Audit Scheduled" },
  { value: "AUDITING",           label: "Auditing" },
  { value: "ACTION_REQUIRED_NCR","label": "NCR Issued" },
  { value: "VERIFYING_NCR",      label: "Verifying NCR" },
  { value: "BOARD_REVIEW",       label: "Board Review" },
  { value: "CERTIFIED",          label: "Certified" },
  { value: "REJECTED",           label: "Rejected" },
  { value: "CLOSED_INCOMPLETE",  label: "Closed" },
];

const SCHEME_FILTER_OPTIONS = [
  { value: "", label: "All Schemes" },
  { value: "FB", label: "FB — Food & Beverages" },
  { value: "FP", label: "FP — Food Premises" },
  { value: "AQ", label: "AQ — Aquatic Animals" },
  { value: "SL", label: "SL — Slaughterhouse / Meat" },
  { value: "CS", label: "CS — Cosmetics & Personal Care" },
  { value: "PH", label: "PH — Pharmaceuticals" },
  { value: "CG", label: "CG — Consumer Goods" },
  { value: "LG", label: "LG — Logistics & Supply Chain" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "updated", label: "Recently Updated" },
];

export default function AdminApplicationList({ applications, viewerRole }: { applications: Application[]; viewerRole?: string }) {
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [schemeFilter, setSchemeFilter] = useState("");
  const [sortBy,       setSortBy]       = useState("newest");
  const [showFilters,  setShowFilters]  = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = applications.filter(app => {
      if (statusFilter && app.status !== statusFilter) return false;
      if (schemeFilter && app.schemeCode !== schemeFilter) return false;
      if (!q) return true;
      return (
        app.businessName.toLowerCase().includes(q) ||
        app.user.name.toLowerCase().includes(q) ||
        app.user.email.toLowerCase().includes(q) ||
        (app.referenceNumber ?? "").toLowerCase().includes(q) ||
        (app.schemeCode ?? "").toLowerCase().includes(q) ||
        app.sector.toLowerCase().includes(q)
      );
    });

    if (sortBy === "oldest")  list = [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else if (sortBy === "updated") list = [...list]; // already sorted by updatedAt from server ideally
    // "newest" is the default from the server

    return list;
  }, [applications, search, statusFilter, schemeFilter, sortBy]);

  const newCount     = applications.filter(a => isNew(a.createdAt)).length;
  const hasNewApps   = newCount > 0;
  const activeCount  = applications.filter(a => !["CERTIFIED","REJECTED","CLOSED_INCOMPLETE"].includes(a.status)).length;

  return (
    <div>
      {/* New applications notification banner */}
      {hasNewApps && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.25)", marginBottom: 16 }}>
          <Bell size={16} color="#9a7810" />
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#78610D", flex: 1 }}>
            <strong>{newCount} new application{newCount !== 1 ? "s" : ""}</strong> received in the last 24 hours — review and begin screening.
          </p>
          <button onClick={() => setStatusFilter("SUBMITTED")} style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: "#9a7810", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
            View Submitted
          </button>
        </div>
      )}

      {/* Search + filter bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
            <Search size={14} color="rgba(10,21,53,0.35)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by company, email, reference number, scheme…"
              style={{
                width: "100%", padding: "10px 12px 10px 34px",
                background: "#fff", border: "1px solid rgba(10,21,53,0.12)",
                borderRadius: 8, fontFamily: "var(--font-body)", fontSize: 13, color: "#0A1535",
                outline: "none", boxSizing: "border-box",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                <X size={12} color="rgba(10,21,53,0.35)" />
              </button>
            )}
          </div>

          {/* Status filter */}
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: "10px 12px", background: "#fff", border: "1px solid rgba(10,21,53,0.12)", borderRadius: 8, fontFamily: "var(--font-body)", fontSize: 13, color: "#0A1535", cursor: "pointer", outline: "none" }}>
            {STATUS_FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Toggle extra filters */}
          <button
            onClick={() => setShowFilters(f => !f)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 14px", background: showFilters ? "rgba(109,40,217,0.08)" : "#fff",
              border: `1px solid ${showFilters ? "rgba(109,40,217,0.25)" : "rgba(10,21,53,0.12)"}`,
              borderRadius: 8, fontFamily: "var(--font-body)", fontSize: 13, color: showFilters ? "#6D28D9" : "rgba(10,21,53,0.55)",
              cursor: "pointer",
            }}
          >
            <Filter size={13} /> Filters {(schemeFilter || sortBy !== "newest") && "•"}
          </button>

          {/* Result count */}
          <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.45)", whiteSpace: "nowrap" }}>
            {filtered.length} of {applications.length}
            {activeCount > 0 && <span style={{ marginLeft: 8, color: "#6366F1" }}>· {activeCount} active</span>}
          </span>
        </div>

        {/* Extra filters */}
        {showFilters && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", padding: "12px 14px", borderRadius: 8, background: "rgba(109,40,217,0.03)", border: "1px solid rgba(109,40,217,0.1)" }}>
            <select value={schemeFilter} onChange={e => setSchemeFilter(e.target.value)} style={{ padding: "8px 10px", background: "#fff", border: "1px solid rgba(10,21,53,0.12)", borderRadius: 6, fontFamily: "var(--font-body)", fontSize: 12.5, color: "#0A1535", cursor: "pointer", outline: "none" }}>
              {SCHEME_FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "8px 10px", background: "#fff", border: "1px solid rgba(10,21,53,0.12)", borderRadius: 6, fontFamily: "var(--font-body)", fontSize: 12.5, color: "#0A1535", cursor: "pointer", outline: "none" }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {(statusFilter || schemeFilter || sortBy !== "newest") && (
              <button onClick={() => { setStatusFilter(""); setSchemeFilter(""); setSortBy("newest"); }} style={{ padding: "8px 12px", background: "none", border: "1px solid rgba(10,21,53,0.12)", borderRadius: 6, fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.5)", cursor: "pointer" }}>
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <GlowingCard style={{ padding: "32px", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.55)" }}>
            {applications.length === 0 ? "No applications yet." : "No applications match your search or filters."}
          </p>
        </GlowingCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((app, i) => (
            <ApplicationRow key={app.id} app={app} defaultOpen={i === 0 && applications.length <= 5} viewerRole={viewerRole} />
          ))}
        </div>
      )}
    </div>
  );
}
