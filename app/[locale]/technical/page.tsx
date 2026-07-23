import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Microscope, FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import AdminApplicationList from "@/components/dashboard/AdminApplicationList";

type Params = { params: Promise<{ locale: string }> };

const TECHNICAL_STAGES = ["BOARD_REVIEW"] as const;

export default async function TechnicalPage({ params }: Params) {
  const { locale } = await params;
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;

  const allowed = ["ADMIN", "SUPER_ADMIN", "TECHNICAL"];
  if (!user?.role || !allowed.includes(user.role)) {
    redirect(`/${locale}/auth/login`);
  }

  const applications = await prisma.certificationApplication.findMany({
    where: { status: { in: [...TECHNICAL_STAGES] } },
    include: {
      user: { select: { name: true, email: true } },
      payments: true,
      certificate: true,
    },
    orderBy: { updatedAt: "asc" }, // oldest first — review in order
  });

  // Also fetch recently certified for context
  const recentlyCertified = await prisma.certificationApplication.count({
    where: {
      status: "CERTIFIED",
      updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
  });

  const STATS = [
    { label: "Awaiting Technical Review", value: applications.length, color: "#6366F1", bg: "rgba(99,102,241,0.07)",  border: "rgba(99,102,241,0.2)",  icon: Microscope },
    { label: "Certified (30 days)",       value: recentlyCertified,   color: "#22C55E", bg: "rgba(34,197,94,0.07)",   border: "rgba(34,197,94,0.2)",   icon: CheckCircle2 },
    { label: "Oldest in Queue",           value: applications[0] ? Math.floor((Date.now() - new Date(applications[0].createdAt).getTime()) / 86400000) : 0, color: "#F97316", bg: "rgba(249,115,22,0.07)", border: "rgba(249,115,22,0.2)", icon: Clock },
    { label: "Total Files",              value: applications.length,  color: "#8B5CF6", bg: "rgba(139,92,246,0.07)", border: "rgba(139,92,246,0.2)", icon: FileText },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.22)", borderRadius: 6, marginBottom: 14 }}>
          <Microscope size={13} color="#6366F1" />
          <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "#6366F1", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Technical Review Team
          </span>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "#0A1535", marginBottom: 4 }}>
          Certification Preparation
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.68)" }}>
          Review complete audit files submitted for Board approval. Prepare technical documentation and add review notes before the Shariah Panel&apos;s final validation.
        </p>
      </div>

      {/* Notification banners */}
      {applications.length > 0 && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 10, padding: "14px 18px", marginBottom: 16 }}>
          <AlertCircle size={16} color="#6366F1" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 700, color: "#6366F1", margin: "0 0 2px" }}>
              {applications.length} Application{applications.length !== 1 ? "s" : ""} Pending Technical Assessment
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.72)", margin: 0 }}>
              Audit files have passed inspection. Review each application&apos;s technical compliance, add review notes, and prepare documentation for the Shariah Panel&apos;s final validation.
            </p>
          </div>
        </div>
      )}
      {applications.length === 0 && recentlyCertified > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "12px 18px", marginBottom: 16 }}>
          <CheckCircle2 size={15} color="#16A34A" />
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#16A34A", margin: 0, fontWeight: 600 }}>
            Queue is clear — {recentlyCertified} certificate{recentlyCertified !== 1 ? "s" : ""} issued in the last 30 days.
          </p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {STATS.map(({ label, value, color, bg, border, icon: Icon }) => (
          <div key={label} style={{ background: "#ffffff", borderRadius: 12, border: `1px solid ${border}`, padding: "18px 22px", boxShadow: "0 1px 4px rgba(10,21,53,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: bg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={13} color={color} />
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {label}{label === "Oldest in Queue" ? " days" : ""}
              </p>
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 600, color: "#0A1535" }}>{value}</p>
          </div>
        ))}
      </div>

      {applications.length === 0 ? (
        <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid rgba(10,21,53,0.08)", padding: "48px 32px", textAlign: "center" }}>
          <CheckCircle2 size={32} color="rgba(10,21,53,0.15)" style={{ margin: "0 auto 12px" }} />
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.64)" }}>No applications awaiting technical review.</p>
        </div>
      ) : (
        <AdminApplicationList applications={applications as never} viewerRole="TECHNICAL" />
      )}
    </div>
  );
}
