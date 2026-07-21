"use client";
import { useState, useMemo } from "react";
import { Award, Search, X, ChevronDown, ChevronUp, Bell } from "lucide-react";
import GlowingCard from "@/components/ui/GlowingCard";
import ApplicationStages from "@/components/dashboard/ApplicationStages";
import DocumentUpload from "@/components/dashboard/DocumentUpload";

type Payment = { id: string; amount: number; currency: string; status: string };
type Certificate = { id: string; serial: string; issuedAt: string | Date };

const SCALE_LABEL: Record<string, string> = {
  LARGE: "Large Scale", MEDIUM: "Medium Scale", SMALL: "Small Scale",
};

// Human-readable display names for each status
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
  // Legacy
  PENDING:             "Pending",
  UNDER_REVIEW:        "Under Review",
  APPROVED:            "Approved",
};

const STATUS_COLOR: Record<string, string> = {
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

// Allowed state transitions from each status
const TRANSITIONS: Record<string, Array<{ to: string; label: string; color: string }>> = {
  SUBMITTED:           [{ to: "SCREENING",         label: "Begin Screening",              color: "#3B82F6" }],
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
  AWAITING_PAYMENT:    [{ to: "PENDING_AUDIT",    label: "Payment Received",             color: "#16A34A" }],
  PENDING_AUDIT:       [{ to: "AUDITING",          label: "Audit Started",                color: "#0891B2" }],
  AUDITING:            [
    { to: "ACTION_REQUIRED_NCR", label: "Issue NCR (Non-Conformance)", color: "#F97316" },
    { to: "BOARD_REVIEW",        label: "No Issues — Send to Board",   color: "#16A34A" },
  ],
  ACTION_REQUIRED_NCR: [{ to: "VERIFYING_NCR",    label: "Evidence Received",            color: "#3B82F6" }],
  VERIFYING_NCR:       [
    { to: "BOARD_REVIEW",        label: "NCR Passed — Send to Board",  color: "#16A34A" },
    { to: "REJECTED",            label: "NCR Failed — Reject",         color: "#EF4444" },
  ],
  BOARD_REVIEW:        [
    { to: "CERTIFIED",           label: "Board Approved — Certify ✓",  color: "#C9A227" },
    { to: "REJECTED",            label: "Board Rejected",               color: "#EF4444" },
  ],
  // Terminal states
  CERTIFIED:           [],
  REJECTED:            [],
  CLOSED_INCOMPLETE:   [],
  // Legacy transitions
  PENDING:             [{ to: "SUBMITTED",         label: "Update to Submitted",          color: "#6366F1" }],
  UNDER_REVIEW:        [{ to: "SCREENING",          label: "Move to Screening",            color: "#3B82F6" }],
  APPROVED:            [{ to: "CERTIFIED",          label: "Mark as Certified",            color: "#C9A227" }],
};

type AppStatus = keyof typeof STATUS_DISPLAY;

type Application = {
  id: string;
  businessName: string;
  sector: string;
  schemeCode: string | null;
  referenceNumber: string | null;
  productionScale: string | null;
  productList: string;
  notes: string | null;
  deficiencyNotes: string | null;
  auditDate: string | Date | null;
  documents: string | null;
  status: AppStatus;
  certIssueMode: "ON_APPROVAL" | "ON_PAYMENT" | "MANUAL";
  reviewNotes: string | null;
  createdAt: string | Date;
  user: { name: string; email: string };
  payments: Payment[];
  certificate: Certificate | null;
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

// States each role is allowed to advance (undefined = no restriction = ADMIN)
const REVIEWER_STATES  = new Set(["SUBMITTED","SCREENING","DEFICIENCY_NOTICE","ELIGIBILITY_REVIEW","TRC_ESCALATION","AWAITING_PAYMENT","PENDING_AUDIT"]);
const INSPECTOR_STATES = new Set(["PENDING_AUDIT","AUDITING","ACTION_REQUIRED_NCR","VERIFYING_NCR","BOARD_REVIEW"]);
// BOARD_REVIEW → CERTIFIED is an admin-only action
const ADMIN_ONLY_TRANSITIONS = new Set(["CERTIFIED"]);

function ApplicationRow({
  app: initialApp,
  defaultOpen,
  viewerRole,
}: {
  app: Application;
  defaultOpen: boolean;
  viewerRole?: string;
}) {
  const [app,           setApp]           = useState(initialApp);
  const [open,         setOpen]           = useState(defaultOpen);
  const [reviewNotes,  setReviewNotes]    = useState(app.reviewNotes || "");
  const [defNotes,     setDefNotes]       = useState(app.deficiencyNotes || "");
  const [feeAmount,    setFeeAmount]      = useState("");
  const [saving,       setSaving]         = useState(false);
  const [message,      setMessage]        = useState("");

  // Filter available transitions based on caller's role
  const allTransitions = TRANSITIONS[app.status] ?? [];
  const transitions = allTransitions.filter(t => {
    if (!viewerRole || viewerRole === "ADMIN") return true;
    if (ADMIN_ONLY_TRANSITIONS.has(t.to)) return false;          // only ADMIN can certify
    if (viewerRole === "REVIEWER") return REVIEWER_STATES.has(app.status);
    if (viewerRole === "INSPECTOR") return INSPECTOR_STATES.has(app.status);
    return true;
  });
  const color       = STATUS_COLOR[app.status] ?? "#94A3B8";
  const display     = STATUS_DISPLAY[app.status] ?? app.status;
  const newBadge    = isNew(app.createdAt);

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
        referenceNumber: data.application.referenceNumber,
        certificate:     data.certificate || prev.certificate,
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
    if (defNotes) body.deficiencyNotes = defNotes;
    if (feeAmount) {
      body.feeAmountNgn    = Number(feeAmount);
      body.feeDescription  = `Certification fee — ${app.businessName}`;
    }
    if (toStatus === "CERTIFIED") body.issueCertificate = true;
    patch(body);
  };

  const saveNotes = () => patch({ reviewNotes, deficiencyNotes: defNotes });

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
            {app.referenceNumber && (
              <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "#6D28D9", background: "rgba(109,40,217,0.07)", padding: "1px 8px", borderRadius: 4 }}>
                {app.referenceNumber}
              </span>
            )}
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.45)", margin: "4px 0 0" }}>
            {app.user.name} · {app.user.email}
            {app.schemeCode && <span style={{ marginLeft: 8, fontWeight: 600, color: "#6D28D9" }}>{app.schemeCode}</span>}
            {app.productionScale && (
              <span style={{ marginLeft: 6, padding: "1px 6px", borderRadius: 3, background: "rgba(201,162,39,0.1)", color: "#9a7810", fontWeight: 700, fontSize: 10 }}>
                {SCALE_LABEL[app.productionScale] ?? app.productionScale}
              </span>
            )}
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
          <div style={{ marginBottom: 16 }}>
            <ApplicationStages status={app.status} certificateIssued={!!app.certificate} />
          </div>

          {/* Products + notes */}
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.65)", marginBottom: 10, whiteSpace: "pre-wrap" }}>{app.productList}</p>
          {app.notes && <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.45)", marginBottom: 10 }}>Client notes: {app.notes}</p>}

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
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.5)", marginBottom: 12 }}>
              Payments: {app.payments.map(p => `${p.currency} ${(p.amount / 100).toLocaleString()} (${p.status})`).join(", ")}
            </p>
          )}

          {/* Certificate */}
          {app.certificate ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, padding: "10px 14px", borderRadius: 8, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
              <Award size={16} color="#22C55E" />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#22C55E", fontWeight: 600 }}>
                Certificate issued — {app.certificate.serial}
              </span>
            </div>
          ) : (
            /* Fee invoicing — show when payment might be expected */
            ["AWAITING_PAYMENT", "ELIGIBILITY_REVIEW", "TRC_ESCALATION", "BOARD_REVIEW"].includes(app.status) && (
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "rgba(10,21,53,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Invoice / Fee</p>
                <input
                  value={feeAmount}
                  onChange={e => setFeeAmount(e.target.value)}
                  placeholder="Quote fee (NGN) — leave blank to skip"
                  type="number" min="0"
                  style={inputStyle}
                />
              </div>
            )
          )}

          {/* Deficiency notes field */}
          {["SCREENING", "DEFICIENCY_NOTICE"].includes(app.status) && (
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "rgba(10,21,53,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Deficiency Notice Details</p>
              <textarea
                rows={2}
                value={defNotes}
                onChange={e => setDefNotes(e.target.value)}
                placeholder="List missing or incomplete documents…"
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
          )}

          {/* Review notes */}
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "rgba(10,21,53,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Internal Review Notes</p>
            <textarea
              rows={2}
              value={reviewNotes}
              onChange={e => setReviewNotes(e.target.value)}
              placeholder="Internal notes (visible to admin only)"
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {message && (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: message === "Saved." ? "#22c55e" : "#ef4444", marginBottom: 10 }}>{message}</p>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={saveNotes}
              disabled={saving}
              className="btn-ghost"
              style={{ fontSize: 12.5, padding: "8px 14px", opacity: saving ? 0.6 : 1 }}
            >
              {saving ? "Saving…" : "Save Notes"}
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

// Status filter options
const FILTER_OPTIONS = [
  { value: "",                  label: "All Applications" },
  { value: "SUBMITTED",         label: "Submitted" },
  { value: "SCREENING",         label: "Screening" },
  { value: "DEFICIENCY_NOTICE", label: "Action Required" },
  { value: "ELIGIBILITY_REVIEW",label: "Eligibility Review" },
  { value: "TRC_ESCALATION",    label: "TRC Review" },
  { value: "AWAITING_PAYMENT",  label: "Awaiting Payment" },
  { value: "PENDING_AUDIT",     label: "Audit Scheduled" },
  { value: "AUDITING",          label: "Auditing" },
  { value: "BOARD_REVIEW",      label: "Board Review" },
  { value: "CERTIFIED",         label: "Certified" },
  { value: "REJECTED",          label: "Rejected" },
  { value: "CLOSED_INCOMPLETE", label: "Closed" },
];

export default function AdminApplicationList({ applications, viewerRole }: { applications: Application[]; viewerRole?: string }) {
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return applications.filter(app => {
      const matchStatus = !statusFilter || app.status === statusFilter;
      if (!matchStatus) return false;
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
  }, [applications, search, statusFilter]);

  const newCount = applications.filter(a => isNew(a.createdAt)).length;

  return (
    <div>
      {/* Search + filter bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
          <Search size={14} color="rgba(10,21,53,0.35)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by company, email, ref number…"
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

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: "10px 12px", background: "#fff", border: "1px solid rgba(10,21,53,0.12)", borderRadius: 8, fontFamily: "var(--font-body)", fontSize: 13, color: "#0A1535", cursor: "pointer", outline: "none" }}
        >
          {FILTER_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.45)", whiteSpace: "nowrap" }}>
          {filtered.length} of {applications.length}
          {newCount > 0 && (
            <span style={{ marginLeft: 10, fontWeight: 700, color: "#9a7810" }}>· {newCount} new today</span>
          )}
        </span>
      </div>

      {filtered.length === 0 ? (
        <GlowingCard style={{ padding: "32px", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.55)" }}>
            {applications.length === 0 ? "No applications yet." : "No applications match your search."}
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
