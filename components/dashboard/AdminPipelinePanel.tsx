"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowUpRight, Clock } from "lucide-react";
import type { StageCount, ActionItem } from "@/lib/admin-dashboard-stats";

const STAGE_COLOR: Record<string, string> = {
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
};

function daysAgo(date: Date | string) {
  const ms = Date.now() - new Date(date).getTime();
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default function AdminPipelinePanel({
  pipelineCounts,
  actionRequired,
}: {
  pipelineCounts: StageCount[];
  actionRequired: ActionItem[];
}) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const total = pipelineCounts.reduce((s, p) => s + p.count, 0);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16 }} className="admin-pipeline-grid">
      {/* ── Pipeline by exact stage ── */}
      <div style={{
        background: "#ffffff", borderRadius: 14,
        border: "1px solid rgba(10,21,53,0.08)",
        padding: "22px 24px",
        boxShadow: "0 1px 4px rgba(10,21,53,0.05)",
      }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: "#0A1535", marginBottom: 18 }}>
          Applications by Pipeline Stage
        </p>
        {total === 0 ? (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.7)", padding: "24px 0", textAlign: "center" }}>
            No active applications in the pipeline.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pipelineCounts.map(stage => {
              const pct = total > 0 ? (stage.count / total) * 100 : 0;
              const color = STAGE_COLOR[stage.status] ?? "#94a3b8";
              return (
                <div key={stage.status} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ flex: "0 0 168px", fontFamily: "var(--font-body)", fontSize: 12.5, color: "#0A1535" }}>{stage.label}</span>
                  <div style={{ flex: 1, height: 8, background: "rgba(10,21,53,0.06)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4 }} />
                  </div>
                  <span style={{ flex: "0 0 24px", textAlign: "right", fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 700, color: "#0A1535" }}>{stage.count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Needs attention ── */}
      <div style={{
        background: "#ffffff", borderRadius: 14,
        border: "1px solid rgba(10,21,53,0.08)",
        padding: "22px 24px",
        boxShadow: "0 1px 4px rgba(10,21,53,0.05)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: "#0A1535", margin: 0 }}>
            Needs DAHC Action
          </p>
          <Link href={`/${locale}/admin/applications`} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--font-body)", fontSize: 12, color: "#C9A227", textDecoration: "none", fontWeight: 600 }}>
            View all <ArrowUpRight size={13} />
          </Link>
        </div>
        {actionRequired.length === 0 ? (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.7)", padding: "24px 0", textAlign: "center" }}>
            Nothing waiting on DAHC right now.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {actionRequired.map(item => (
              <Link
                key={item.id}
                href={`/${locale}/admin/applications`}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                  padding: "10px 8px", borderRadius: 8, textDecoration: "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(10,21,53,0.03)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "#0A1535", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.businessName}
                  </p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: STAGE_COLOR[item.status] ?? "#94a3b8", margin: 0, fontWeight: 600 }}>
                    {item.statusLabel}
                  </p>
                </div>
                <span style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(10,21,53,0.6)" }}>
                  <Clock size={11} /> {daysAgo(item.updatedAt)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
