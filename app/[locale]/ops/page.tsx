import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { FileSearch, CheckCircle, AlertCircle, CreditCard } from "lucide-react";
import AdminApplicationList from "@/components/dashboard/AdminApplicationList";

type Params = { params: Promise<{ locale: string }> };

// Operations Manager handles the eligibility & approval pipeline
const OPS_STAGES = [
  "ELIGIBILITY_REVIEW",
  "TRC_ESCALATION",
  "AWAITING_PAYMENT",
] as const;

export default async function OpsManagerPage({ params }: Params) {
  const { locale } = await params;
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;

  const allowed = ["ADMIN", "SUPER_ADMIN", "OPERATIONS_MANAGER"];
  if (!user?.role || !allowed.includes(user.role)) {
    redirect(`/${locale}/auth/login`);
  }

  const applications = await prisma.certificationApplication.findMany({
    where: { status: { in: [...OPS_STAGES] } },
    include: {
      user: { select: { name: true, email: true } },
      payments: true,
      certificate: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const eligibilityCount   = applications.filter(a => a.status === "ELIGIBILITY_REVIEW").length;
  const trcCount           = applications.filter(a => a.status === "TRC_ESCALATION").length;
  const awaitingPayment    = applications.filter(a => a.status === "AWAITING_PAYMENT").length;
  const totalActive        = applications.length;

  const STATS = [
    { label: "Eligibility Review",  value: eligibilityCount,  color: "#8B5CF6", bg: "rgba(139,92,246,0.07)",  border: "rgba(139,92,246,0.2)",  icon: FileSearch },
    { label: "TRC / Shariah Review",value: trcCount,          color: "#7C3AED", bg: "rgba(124,58,237,0.07)",  border: "rgba(124,58,237,0.2)",  icon: AlertCircle },
    { label: "Awaiting Payment",    value: awaitingPayment,   color: "#0EA5E9", bg: "rgba(14,165,233,0.07)",  border: "rgba(14,165,233,0.2)",  icon: CreditCard },
    { label: "Total in Pipeline",   value: totalActive,       color: "#6366F1", bg: "rgba(99,102,241,0.07)",  border: "rgba(99,102,241,0.2)",  icon: CheckCircle },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.22)", borderRadius: 6, marginBottom: 14 }}>
          <FileSearch size={13} color="#8B5CF6" />
          <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "#8B5CF6", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Operations Manager Portal
          </span>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "#0A1535", marginBottom: 4 }}>
          Eligibility Review Queue
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.5)" }}>
          Verify the Admin's screening assessment, conduct eligibility evaluations, manage TRC escalations, and approve applications for registration.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {STATS.map(({ label, value, color, bg, border, icon: Icon }) => (
          <div key={label} style={{ background: "#ffffff", borderRadius: 12, border: `1px solid ${border}`, padding: "18px 22px", boxShadow: "0 1px 4px rgba(10,21,53,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: bg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={13} color={color} />
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 600, color: "#0A1535" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Application list */}
      {applications.length === 0 ? (
        <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid rgba(10,21,53,0.08)", padding: "48px 32px", textAlign: "center" }}>
          <CheckCircle size={32} color="rgba(10,21,53,0.15)" style={{ margin: "0 auto 12px" }} />
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.4)" }}>No applications in the eligibility review pipeline right now.</p>
        </div>
      ) : (
        <AdminApplicationList applications={applications as never} viewerRole="OPERATIONS_MANAGER" />
      )}
    </div>
  );
}
