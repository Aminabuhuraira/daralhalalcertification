"use client";
import { FileText, Search, ClipboardCheck, CreditCard, Building2, ShieldCheck, Award, XCircle, AlertTriangle } from "lucide-react";

// Visual stages (simplified from 15-state machine to 7 milestones)
const STAGES = [
  { label: "Submitted",        icon: FileText },
  { label: "Screening",        icon: Search },
  { label: "Review",           icon: ClipboardCheck },
  { label: "Payment",          icon: CreditCard },
  { label: "Audit",            icon: Building2 },
  { label: "Board",            icon: ShieldCheck },
  { label: "Certified",        icon: Award },
] as const;

// Map each workflow status to a visual step index (0–6)
const STATUS_STEP: Record<string, number> = {
  DRAFT:                -1,
  SUBMITTED:             0,
  SCREENING:             1,
  DEFICIENCY_NOTICE:     1,
  ELIGIBILITY_REVIEW:    2,
  TRC_ESCALATION:        2,
  AWAITING_PAYMENT:      3,
  PENDING_AUDIT:         3,
  AUDITING:              4,
  ACTION_REQUIRED_NCR:   4,
  VERIFYING_NCR:         4,
  BOARD_REVIEW:          5,
  CERTIFIED:             6,
  // Legacy values
  PENDING:               0,
  UNDER_REVIEW:          1,
  APPROVED:              6,
};

const WARNING_STATES = new Set(["DEFICIENCY_NOTICE", "ACTION_REQUIRED_NCR"]);

export default function ApplicationStages({
  status,
  certificateIssued,
}: {
  status: string;
  certificateIssued: boolean;
}) {
  if (status === "REJECTED" || status === "CLOSED_INCOMPLETE") {
    const label = status === "CLOSED_INCOMPLETE" ? "Closed — Incomplete" : "Application Rejected";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
        <XCircle size={16} color="#EF4444" />
        <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, color: "#EF4444" }}>{label}</span>
      </div>
    );
  }

  const isWarning  = WARNING_STATES.has(status);
  const stepIndex  = certificateIssued ? 6 : (STATUS_STEP[status] ?? 0);
  const accentBase = isWarning ? "#D97706" : "#0A1535";
  const accentFin  = "#C9A227";

  return (
    <div style={{ display: "flex", alignItems: "center", overflowX: "auto" }}>
      {STAGES.map((stage, i) => {
        const reached  = i <= stepIndex;
        const isCurrent = i === stepIndex;
        const isLast   = i === STAGES.length - 1;
        const accent   = isLast && reached ? accentFin : accentBase;
        const color    = isCurrent && isWarning ? "#D97706" : accent;
        const Icon = stage.icon;
        return (
          <div key={stage.label} style={{ display: "flex", alignItems: "center", flex: i < STAGES.length - 1 ? 1 : "0 0 auto" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, minWidth: 60 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: reached ? (isCurrent ? color : `${color}25`) : "rgba(10,21,53,0.05)",
                border: reached ? `1px solid ${color}60` : "1px solid rgba(10,21,53,0.1)",
                boxShadow: isCurrent ? `0 0 10px ${color}44` : "none",
                transition: "all 0.3s",
              }}>
                {isCurrent && isWarning
                  ? <AlertTriangle size={13} color="#D97706" />
                  : <Icon size={13} color={reached ? (isCurrent ? "white" : color) : "rgba(10,21,53,0.25)"} />
                }
              </div>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: isCurrent ? 700 : 500, color: reached ? color : "rgba(10,21,53,0.3)", whiteSpace: "nowrap" }}>
                {stage.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div style={{ flex: 1, height: 2, marginBottom: 14, background: i < stepIndex ? `${accentBase}30` : "rgba(10,21,53,0.07)", transition: "background 0.3s", minWidth: 8 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
