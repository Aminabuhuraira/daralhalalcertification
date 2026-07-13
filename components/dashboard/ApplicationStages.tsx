import { FileText, Search, CheckCircle2, Award, XCircle } from "lucide-react";

type Status = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

const STAGES = [
  { key: "PENDING",      label: "Submitted",    icon: FileText },
  { key: "UNDER_REVIEW", label: "Under Review", icon: Search },
  { key: "APPROVED",     label: "Approved",     icon: CheckCircle2 },
  { key: "CERTIFIED",    label: "Certified",    icon: Award },
] as const;

const ORDER: Record<Status, number> = { PENDING: 0, UNDER_REVIEW: 1, APPROVED: 2, REJECTED: 1 };

export default function ApplicationStages({
  status,
  certificateIssued,
}: {
  status: Status;
  certificateIssued: boolean;
}) {
  if (status === "REJECTED") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
        <XCircle size={16} color="#EF4444" />
        <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, color: "#EF4444" }}>Application Rejected</span>
      </div>
    );
  }

  const reachedIndex = certificateIssued ? 3 : ORDER[status];

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {STAGES.map((stage, i) => {
        const reached     = i <= reachedIndex;
        const current     = i === reachedIndex;
        const isCertStage = i === STAGES.length - 1;
        const accent      = isCertStage && reached ? "#C9A227" : "#0A1535";
        const Icon        = stage.icon;
        return (
          <div key={stage.key} style={{ display: "flex", alignItems: "center", flex: i < STAGES.length - 1 ? 1 : "0 0 auto" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 64 }}>
              <div
                style={{
                  width: 30, height: 30, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: reached ? (current ? accent : `${accent}20`) : "rgba(10,21,53,0.05)",
                  border: reached ? `1px solid ${accent}55` : "1px solid rgba(10,21,53,0.1)",
                  boxShadow: current ? `0 0 12px ${accent}44` : "none",
                  transition: "all 0.3s",
                }}
              >
                <Icon size={14} color={reached ? (current ? "white" : accent) : "rgba(10,21,53,0.3)"} />
              </div>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 10.5, fontWeight: current ? 700 : 500, color: reached ? accent : "rgba(10,21,53,0.35)", whiteSpace: "nowrap" }}>
                {stage.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div style={{ flex: 1, height: 2, marginBottom: 16, background: i < reachedIndex ? "rgba(10,21,53,0.25)" : "rgba(10,21,53,0.08)", transition: "background 0.3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
