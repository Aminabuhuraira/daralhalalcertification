import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ClipboardList, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import AdminApplicationList from "@/components/dashboard/AdminApplicationList";

type Params = { params: Promise<{ locale: string }> };

// Audit-stage states this portal manages
const AUDIT_STAGES = [
  "PENDING_AUDIT",
  "AUDITING",
  "ACTION_REQUIRED_NCR",
  "VERIFYING_NCR",
  "BOARD_REVIEW",
] as const;

export default async function InspectorPage({ params }: Params) {
  const { locale } = await params;
  const session = await auth();
  const user = session?.user as { id?: string; name?: string; role?: string } | undefined;
  if (!user || (user.role !== "INSPECTOR" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect(`/${locale}/auth/login`);
  }

  const applications = await prisma.certificationApplication.findMany({
    where: { status: { in: [...AUDIT_STAGES] } },
    include: {
      user: { select: { name: true, email: true } },
      payments: true,
      certificate: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const upcomingAudits = applications.filter(a => a.status === "PENDING_AUDIT").length;
  const activeAudits   = applications.filter(a => a.status === "AUDITING").length;
  const ncrCases       = applications.filter(a =>
    a.status === "ACTION_REQUIRED_NCR" || a.status === "VERIFYING_NCR"
  ).length;
  const boardReview    = applications.filter(a => a.status === "BOARD_REVIEW").length;

  const STATS = [
    { label: "Upcoming Audits",  value: upcomingAudits, color: "#0891B2", bg: "rgba(8,145,178,0.07)",   border: "rgba(8,145,178,0.2)",   icon: ClipboardList },
    { label: "Active Audits",    value: activeAudits,   color: "#7C3AED", bg: "rgba(124,58,237,0.07)", border: "rgba(124,58,237,0.2)", icon: Activity },
    { label: "NCR Cases",        value: ncrCases,       color: "#F97316", bg: "rgba(249,115,22,0.07)", border: "rgba(249,115,22,0.2)", icon: AlertTriangle },
    { label: "Awaiting Board",   value: boardReview,    color: "#84CC16", bg: "rgba(132,204,22,0.07)", border: "rgba(132,204,22,0.2)", icon: CheckCircle2 },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "4px 12px",
          background: "rgba(8,145,178,0.08)", border: "1px solid rgba(8,145,178,0.22)",
          borderRadius: 6, marginBottom: 14,
        }}>
          <Activity size={13} color="#0891B2" />
          <span style={{
            fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700,
            color: "#0891B2", textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            Audit Inspector Portal
          </span>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "#0A1535", marginBottom: 4 }}>
          Audit Management
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.68)" }}>
          Schedule, conduct, and resolve audits for approved certification applications.
        </p>
      </div>

      {/* Notification banners */}
      {upcomingAudits > 0 && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "rgba(8,145,178,0.05)", border: "1px solid rgba(8,145,178,0.25)", borderRadius: 10, padding: "14px 18px", marginBottom: 16 }}>
          <AlertTriangle size={16} color="#0891B2" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 700, color: "#0891B2", margin: "0 0 2px" }}>
              {upcomingAudits} Audit{upcomingAudits !== 1 ? "s" : ""} Scheduled and Awaiting Inspection
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.72)", margin: 0 }}>
              Payment confirmed. Assign inspection teams and conduct on-site audits for these applications.
            </p>
          </div>
        </div>
      )}
      {ncrCases > 0 && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.25)", borderRadius: 10, padding: "14px 18px", marginBottom: 16 }}>
          <AlertTriangle size={16} color="#F97316" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 700, color: "#F97316", margin: "0 0 2px" }}>
              {ncrCases} NCR Case{ncrCases !== 1 ? "s" : ""} Require Review
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.72)", margin: 0 }}>
              Non-conformance reports are active. Verify corrective action responses submitted by applicants and decide on closure or further action.
            </p>
          </div>
        </div>
      )}
      {boardReview > 0 && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "rgba(132,204,22,0.05)", border: "1px solid rgba(132,204,22,0.25)", borderRadius: 10, padding: "14px 18px", marginBottom: 16 }}>
          <CheckCircle2 size={16} color="#65A30D" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 700, color: "#65A30D", margin: "0 0 2px" }}>
              {boardReview} Application{boardReview !== 1 ? "s" : ""} Advanced to Board Review
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.72)", margin: 0 }}>
              Audit complete with satisfactory results. These files have been handed off to the Technical Team and Shariah Panel for final approval.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {STATS.map(({ label, value, color, bg, border, icon: Icon }) => (
          <div key={label} style={{
            background: "#ffffff", borderRadius: 12,
            border: `1px solid ${border}`, padding: "18px 22px",
            boxShadow: "0 1px 4px rgba(10,21,53,0.05)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, background: bg,
                border: `1px solid ${border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={13} color={color} />
              </div>
              <p style={{
                fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700,
                color, textTransform: "uppercase", letterSpacing: "0.07em",
              }}>
                {label}
              </p>
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 600, color: "#0A1535" }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Application list — audit stages only */}
      {applications.length === 0 ? (
        <div style={{
          background: "#ffffff", borderRadius: 14, border: "1px solid rgba(10,21,53,0.08)",
          padding: "48px 32px", textAlign: "center",
        }}>
          <CheckCircle2 size={32} color="rgba(10,21,53,0.15)" style={{ margin: "0 auto 12px" }} />
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.64)" }}>
            No applications in the audit pipeline right now.
          </p>
        </div>
      ) : (
        <AdminApplicationList applications={applications as never} viewerRole="INSPECTOR" />
      )}
    </div>
  );
}
