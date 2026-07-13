import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import AdminApplicationList from "@/components/dashboard/AdminApplicationList";
import { ClipboardCheck } from "lucide-react";

type Params = { params: Promise<{ locale: string }> };

export default async function ReviewerPage({ params }: Params) {
  const { locale } = await params;
  const session = await auth();
  const user = session?.user as { id?: string; name?: string; role?: string } | undefined;
  const allowedRoles = ["ADMIN", "REVIEWER", "INSPECTOR"];
  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    redirect(`/${locale}/auth/login`);
  }

  const applications = await prisma.certificationApplication.findMany({
    include: {
      user: { select: { name: true, email: true } },
      payments: true,
      certificate: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const pending   = applications.filter((a) => a.status === "PENDING").length;
  const reviewing = applications.filter((a) => a.status === "UNDER_REVIEW").length;
  const approved  = applications.filter((a) => a.status === "APPROVED").length;

  const roleLabel = user.role === "INSPECTOR" ? "Inspector" : "Reviewer";

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 6, marginBottom: 14 }}>
          <ClipboardCheck size={13} color="#2563EB" />
          <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.06em" }}>{roleLabel} Portal</span>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "#0A1535", marginBottom: 4 }}>
          Certification Applications
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.5)" }}>
          Review, assess, and update the status of incoming applications.
        </p>
      </div>

      {/* Quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Pending Review",   value: pending,   color: "#D97706", bg: "rgba(217,119,6,0.08)",   border: "rgba(217,119,6,0.2)" },
          { label: "Under Review",     value: reviewing, color: "#2563EB", bg: "rgba(37,99,235,0.08)",   border: "rgba(37,99,235,0.2)" },
          { label: "Approved",         value: approved,  color: "#16A34A", bg: "rgba(22,163,74,0.08)",   border: "rgba(22,163,74,0.2)" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#ffffff", borderRadius: 12, border: `1px solid ${s.border}`, padding: "18px 22px", boxShadow: "0 1px 4px rgba(10,21,53,0.05)" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600, color: "#0A1535" }}>{s.value}</p>
          </div>
        ))}
      </div>

      <AdminApplicationList applications={applications} />
    </div>
  );
}
