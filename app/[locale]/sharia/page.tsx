import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Moon, ShieldCheck, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import AdminApplicationList from "@/components/dashboard/AdminApplicationList";

type Params = { params: Promise<{ locale: string }> };

export default async function ShariaPage({ params }: Params) {
  const { locale } = await params;
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;

  const allowed = ["ADMIN", "SUPER_ADMIN", "SHARIA_PANEL"];
  if (!user?.role || !allowed.includes(user.role)) {
    redirect(`/${locale}/auth/login`);
  }

  // Sharia Panel reviews BOARD_REVIEW applications for final certification
  const applications = await prisma.certificationApplication.findMany({
    where: { status: "BOARD_REVIEW" },
    include: {
      user: { select: { name: true, email: true } },
      payments: true,
      certificate: true,
    },
    orderBy: { updatedAt: "asc" },
  });

  // Stats context
  const [certified30d, rejected30d] = await Promise.all([
    prisma.certificationApplication.count({
      where: { status: "CERTIFIED", updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    }),
    prisma.certificationApplication.count({
      where: { status: "REJECTED", updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    }),
  ]);

  const STATS = [
    { label: "Awaiting Final Approval", value: applications.length, color: "#84CC16", bg: "rgba(132,204,22,0.07)", border: "rgba(132,204,22,0.2)",  icon: ShieldCheck },
    { label: "Certified (30 days)",     value: certified30d,         color: "#22C55E", bg: "rgba(34,197,94,0.07)",  border: "rgba(34,197,94,0.2)",   icon: CheckCircle2 },
    { label: "Rejected (30 days)",      value: rejected30d,          color: "#EF4444", bg: "rgba(239,68,68,0.07)", border: "rgba(239,68,68,0.2)",   icon: XCircle },
    { label: "Sharia Approval Rate",    value: certified30d + rejected30d > 0 ? Math.round(certified30d / (certified30d + rejected30d) * 100) : 0, color: "#6366F1", bg: "rgba(99,102,241,0.07)", border: "rgba(99,102,241,0.2)", icon: Moon },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", background: "rgba(132,204,22,0.08)", border: "1px solid rgba(132,204,22,0.25)", borderRadius: 6, marginBottom: 14 }}>
          <Moon size={13} color="#65A30D" />
          <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "#65A30D", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Shariah Panel
          </span>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "#0A1535", marginBottom: 4 }}>
          Final Shariah Validation
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.5)" }}>
          Review complete audit files and the Technical Team&apos;s assessment. Issue final certification approval or rejection in accordance with Shariah standards.
        </p>
      </div>

      {/* Notification banners */}
      {applications.length > 0 && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "rgba(132,204,22,0.05)", border: "1px solid rgba(132,204,22,0.3)", borderRadius: 10, padding: "14px 18px", marginBottom: 16 }}>
          <AlertTriangle size={16} color="#65A30D" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 700, color: "#65A30D", margin: "0 0 2px" }}>
              {applications.length} Application{applications.length !== 1 ? "s" : ""} Awaiting Final Shariah Validation
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.6)", margin: 0 }}>
              Audit and technical review are complete. The Shariah Panel must issue the final certification decision — approve or reject each application in accordance with Halal standards.
            </p>
          </div>
        </div>
      )}
      {applications.length === 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(22,163,74,0.05)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: 10, padding: "12px 18px", marginBottom: 16 }}>
          <Moon size={15} color="#16A34A" />
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#16A34A", margin: 0, fontWeight: 600 }}>
            No pending reviews — {certified30d} certificate{certified30d !== 1 ? "s" : ""} approved in the last 30 days.
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
                {label}{label === "Sharia Approval Rate" ? " %" : ""}
              </p>
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 600, color: "#0A1535" }}>
              {value}{label === "Sharia Approval Rate" ? "%" : ""}
            </p>
          </div>
        ))}
      </div>

      {applications.length === 0 ? (
        <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid rgba(10,21,53,0.08)", padding: "48px 32px", textAlign: "center" }}>
          <Moon size={32} color="rgba(10,21,53,0.15)" style={{ margin: "0 auto 12px" }} />
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.4)" }}>No applications awaiting Shariah Panel review.</p>
        </div>
      ) : (
        <AdminApplicationList applications={applications as never} viewerRole="SHARIA_PANEL" />
      )}
    </div>
  );
}
