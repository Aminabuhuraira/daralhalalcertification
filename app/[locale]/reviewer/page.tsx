import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Inbox, FileSearch, AlertCircle, CreditCard, AlertTriangle, CheckCircle2 } from "lucide-react";
import AdminApplicationList from "@/components/dashboard/AdminApplicationList";

type Params = { params: Promise<{ locale: string }> };

// Pre-audit states managed by the Certification Review Officer
const REVIEW_STAGES = [
  "SUBMITTED",
  "SCREENING",
  "DEFICIENCY_NOTICE",
  "ELIGIBILITY_REVIEW",
  "TRC_ESCALATION",
  "AWAITING_PAYMENT",
  "PENDING_AUDIT",   // handed off to inspector but reviewer can monitor
] as const;

export default async function ReviewerPage({ params }: Params) {
  const { locale } = await params;
  const session = await auth();
  const user = session?.user as { id?: string; name?: string; role?: string } | undefined;
  const allowedRoles = ["ADMIN", "SUPER_ADMIN", "REVIEWER"];
  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    redirect(`/${locale}/auth/login`);
  }

  const applications = await prisma.certificationApplication.findMany({
    where: { status: { in: [...REVIEW_STAGES] } },
    include: {
      user: { select: { name: true, email: true } },
      payments: true,
      certificate: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const newSubmissions  = applications.filter(a => a.status === "SUBMITTED").length;
  const inScreening     = applications.filter(a => a.status === "SCREENING" || a.status === "DEFICIENCY_NOTICE").length;
  const underReview     = applications.filter(a => a.status === "ELIGIBILITY_REVIEW" || a.status === "TRC_ESCALATION").length;
  const awaitingPayment = applications.filter(a => a.status === "AWAITING_PAYMENT").length;

  const STATS = [
    { label: "New Submissions",   value: newSubmissions,  color: "#6366F1", bg: "rgba(99,102,241,0.07)",  border: "rgba(99,102,241,0.2)",  icon: Inbox },
    { label: "In Screening",      value: inScreening,     color: "#3B82F6", bg: "rgba(59,130,246,0.07)",  border: "rgba(59,130,246,0.2)",  icon: FileSearch },
    { label: "Eligibility Review", value: underReview,    color: "#8B5CF6", bg: "rgba(139,92,246,0.07)",  border: "rgba(139,92,246,0.2)",  icon: AlertCircle },
    { label: "Awaiting Payment",  value: awaitingPayment, color: "#0EA5E9", bg: "rgba(14,165,233,0.07)",  border: "rgba(14,165,233,0.2)",  icon: CreditCard },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "4px 12px",
          background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.22)",
          borderRadius: 6, marginBottom: 14,
        }}>
          <FileSearch size={13} color="#6366F1" />
          <span style={{
            fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700,
            color: "#6366F1", textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            Certification Review Portal
          </span>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "#0A1535", marginBottom: 4 }}>
          Application Review Queue
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.68)" }}>
          Screen documents, conduct eligibility reviews, and advance applications through the pre-audit pipeline.
        </p>
      </div>

      {/* Notification banners */}
      {newSubmissions > 0 && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 10, padding: "14px 18px", marginBottom: 16 }}>
          <AlertTriangle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 700, color: "#DC2626", margin: "0 0 2px" }}>
              {newSubmissions} New Application{newSubmissions !== 1 ? "s" : ""} Awaiting Screening
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.72)", margin: 0 }}>
              These submissions have not yet been reviewed. Conduct administrative screening to verify documents and advance or flag each application.
            </p>
          </div>
        </div>
      )}
      {inScreening > 0 && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "rgba(217,119,6,0.05)", border: "1px solid rgba(217,119,6,0.2)", borderRadius: 10, padding: "14px 18px", marginBottom: 16 }}>
          <AlertCircle size={16} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 700, color: "#D97706", margin: "0 0 2px" }}>
              {inScreening} Application{inScreening !== 1 ? "s" : ""} In Screening or Deficiency Notice
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.72)", margin: 0 }}>
              Review screening progress and check whether applicants have responded to deficiency notices before the 14-day deadline.
            </p>
          </div>
        </div>
      )}
      {newSubmissions === 0 && inScreening === 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(22,163,74,0.05)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: 10, padding: "12px 18px", marginBottom: 16 }}>
          <CheckCircle2 size={15} color="#16A34A" />
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#16A34A", margin: 0, fontWeight: 600 }}>
            All clear — no immediate actions required in the review queue.
          </p>
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

      {/* Application list */}
      {applications.length === 0 ? (
        <div style={{
          background: "#ffffff", borderRadius: 14, border: "1px solid rgba(10,21,53,0.08)",
          padding: "48px 32px", textAlign: "center",
        }}>
          <Inbox size={32} color="rgba(10,21,53,0.15)" style={{ margin: "0 auto 12px" }} />
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.64)" }}>
            No applications awaiting review right now.
          </p>
        </div>
      ) : (
        <AdminApplicationList applications={applications as never} viewerRole="REVIEWER" />
      )}
    </div>
  );
}
