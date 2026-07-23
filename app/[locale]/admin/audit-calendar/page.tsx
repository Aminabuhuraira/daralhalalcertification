import { ensureDb, prisma } from "@/lib/db";
import AdminAuditCalendar from "@/components/dashboard/AdminAuditCalendar";

export default async function AdminAuditCalendarPage() {
  await ensureDb();

  const applications = await prisma.certificationApplication.findMany({
    where: { status: { in: ["PENDING_AUDIT", "AUDITING"] } },
    select: {
      id: true, businessName: true, status: true, auditDate: true,
      auditTeam: true, schemeCode: true, applicationNumber: true, createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  }).catch(() => []);

  const scheduled = applications
    .filter(a => a.auditDate)
    .map(a => ({
      id: a.id,
      businessName: a.businessName,
      status: a.status,
      auditDate: (a.auditDate as Date).toISOString(),
      auditTeam: a.auditTeam,
      schemeCode: a.schemeCode,
      applicationNumber: a.applicationNumber,
    }));

  const needsScheduling = applications
    .filter(a => !a.auditDate && a.status === "PENDING_AUDIT")
    .map(a => ({
      id: a.id,
      businessName: a.businessName,
      schemeCode: a.schemeCode,
      applicationNumber: a.applicationNumber,
      createdAt: a.createdAt.toISOString(),
    }));

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "#0A1535", marginBottom: 4 }}>
          Audit Calendar
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.66)" }}>
          Set and manage on-site audit dates. Applicants are emailed automatically whenever a date is set or changed, and may self-reschedule up to 3 days before their audit.
        </p>
      </div>

      <AdminAuditCalendar scheduled={scheduled} needsScheduling={needsScheduling} />
    </div>
  );
}
