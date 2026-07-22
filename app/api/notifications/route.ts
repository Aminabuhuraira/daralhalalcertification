import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export type Notification = {
  id: string;
  title: string;
  message: string;
  href: string;
  severity: "info" | "warning" | "urgent" | "success";
};

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ notifications: [], totalCount: 0 }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const role   = (session.user as { role?: string }).role ?? "USER";

  const notifications: Notification[] = [];

  try {
    if (role === "USER") {
      const apps = await prisma.certificationApplication.findMany({
        where: { userId },
        select: { id: true, businessName: true, status: true, applicationNumber: true },
        orderBy: { updatedAt: "desc" },
      });
      for (const app of apps) {
        const appLabel = app.applicationNumber ?? app.businessName;
        if (app.status === "DEFICIENCY_NOTICE") {
          notifications.push({ id: `deficiency-${app.id}`, title: "Documents Required", message: `${appLabel} — missing documents must be uploaded within 14 working days`, href: "/dashboard/certification", severity: "urgent" });
        } else if (app.status === "ACTION_REQUIRED_NCR") {
          notifications.push({ id: `ncr-${app.id}`, title: "Non-Conformance Report Issued", message: `${appLabel} — submit your Corrective Action Response to continue`, href: "/dashboard/certification", severity: "urgent" });
        } else if (app.status === "AWAITING_PAYMENT") {
          notifications.push({ id: `payment-${app.id}`, title: "Payment Required", message: `${appLabel} — complete payment to schedule your audit`, href: "/dashboard/billing", severity: "warning" });
        } else if (app.status === "CERTIFIED") {
          notifications.push({ id: `certified-${app.id}`, title: "Certificate Issued", message: `${appLabel} — download your Halal Certificate now`, href: "/dashboard/certificates", severity: "success" });
        } else if (app.status === "DRAFT") {
          notifications.push({ id: `draft-${app.id}`, title: "Draft Application", message: `${appLabel} — complete and submit your application to begin certification`, href: "/dashboard/certification", severity: "info" });
        }
      }
    } else if (role === "REVIEWER") {
      const [submitted, deficiency] = await Promise.all([
        prisma.certificationApplication.count({ where: { status: "SUBMITTED" } }),
        prisma.certificationApplication.count({ where: { status: "DEFICIENCY_NOTICE" } }),
      ]);
      if (submitted > 0) notifications.push({ id: "rev-submitted", title: `${submitted} Awaiting Screening`, message: "New applications submitted and pending administrative review", href: "/reviewer", severity: "urgent" });
      if (deficiency > 0) notifications.push({ id: "rev-deficiency", title: `${deficiency} Pending Response`, message: "Applications in deficiency notice — check if clients have responded", href: "/reviewer", severity: "warning" });
    } else if (role === "OPERATIONS_MANAGER") {
      const [eligibility, trc, payment] = await Promise.all([
        prisma.certificationApplication.count({ where: { status: "ELIGIBILITY_REVIEW" } }),
        prisma.certificationApplication.count({ where: { status: "TRC_ESCALATION" } }),
        prisma.certificationApplication.count({ where: { status: "AWAITING_PAYMENT" } }),
      ]);
      if (eligibility > 0) notifications.push({ id: "ops-eligibility", title: `${eligibility} Eligibility Reviews`, message: "Applications screened and ready for eligibility decision", href: "/ops", severity: "urgent" });
      if (trc > 0) notifications.push({ id: "ops-trc", title: `${trc} TRC Escalations`, message: "Applications pending Technical & Sharia pre-review committee", href: "/ops", severity: "warning" });
      if (payment > 0) notifications.push({ id: "ops-payment", title: `${payment} Awaiting Payment`, message: "Applications approved — confirm when payment is received", href: "/ops", severity: "info" });
    } else if (role === "INSPECTOR") {
      const [scheduled, auditing, ncr] = await Promise.all([
        prisma.certificationApplication.count({ where: { status: "PENDING_AUDIT" } }),
        prisma.certificationApplication.count({ where: { status: "AUDITING" } }),
        prisma.certificationApplication.count({ where: { status: "VERIFYING_NCR" } }),
      ]);
      if (scheduled > 0) notifications.push({ id: "insp-scheduled", title: `${scheduled} Audits Scheduled`, message: "On-site audits pending — ensure inspection teams are assigned", href: "/inspector", severity: "urgent" });
      if (auditing > 0) notifications.push({ id: "insp-active", title: `${auditing} Audits In Progress`, message: "Active audits — update findings and issue NCRs or advance to board", href: "/inspector", severity: "warning" });
      if (ncr > 0) notifications.push({ id: "insp-ncr", title: `${ncr} NCR Responses to Verify`, message: "Applicants have submitted corrective action responses for review", href: "/inspector", severity: "info" });
    } else if (role === "TECHNICAL") {
      const boardReview = await prisma.certificationApplication.count({ where: { status: "BOARD_REVIEW" } });
      if (boardReview > 0) notifications.push({ id: "tech-board", title: `${boardReview} Awaiting Technical Review`, message: "Applications at board stage require technical assessment before Sharia approval", href: "/technical", severity: "urgent" });
    } else if (role === "SHARIA_PANEL") {
      const boardReview = await prisma.certificationApplication.count({ where: { status: "BOARD_REVIEW" } });
      if (boardReview > 0) notifications.push({ id: "sharia-board", title: `${boardReview} Awaiting Sharia Approval`, message: "Applications ready for final Sharia panel review and certification decision", href: "/sharia", severity: "urgent" });
    } else if (role === "ADMIN" || role === "SUPER_ADMIN") {
      const counts = await prisma.certificationApplication.groupBy({
        by: ["status"],
        _count: { id: true },
        where: {
          status: {
            in: ["SUBMITTED", "SCREENING", "DEFICIENCY_NOTICE", "ELIGIBILITY_REVIEW",
                 "TRC_ESCALATION", "AWAITING_PAYMENT", "PENDING_AUDIT", "AUDITING",
                 "ACTION_REQUIRED_NCR", "VERIFYING_NCR", "BOARD_REVIEW"],
          },
        },
      });
      const countMap = Object.fromEntries(counts.map(c => [c.status, c._count.id]));
      const urgent  = (countMap["SUBMITTED"] ?? 0) + (countMap["ACTION_REQUIRED_NCR"] ?? 0) + (countMap["BOARD_REVIEW"] ?? 0);
      const pending = Object.values(countMap).reduce((a, b) => a + b, 0);
      if (urgent > 0) notifications.push({ id: "admin-urgent", title: `${urgent} Urgent Actions`, message: "New submissions, NCR responses, or board reviews need immediate attention", href: "/admin/applications", severity: "urgent" });
      if (pending > urgent) notifications.push({ id: "admin-pipeline", title: `${pending} Applications In Pipeline`, message: "Active applications across all certification stages", href: "/admin/applications", severity: "info" });

      const newUsers = await prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } });
      if (newUsers > 0) notifications.push({ id: "admin-users", title: `${newUsers} New Users This Week`, message: "New registrations in the last 7 days", href: "/admin/users", severity: "info" });
    }
  } catch { /* DB not ready */ }

  return NextResponse.json({ notifications, totalCount: notifications.length });
}
