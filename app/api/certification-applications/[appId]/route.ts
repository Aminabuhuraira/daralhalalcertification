import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { issueApplicationCertificateIfNeeded } from "@/lib/certificates";
import {
  emailApplicationReceived,
  emailDeficiencyNotice,
  emailEligibleAwaitingPayment,
  emailAuditScheduled,
  emailNcrIssued,
  emailCertified,
  emailRejected,
} from "@/lib/email";

type Params = { params: Promise<{ appId: string }> };

const STAFF_WRITE_ROLES = new Set(["ADMIN", "SUPER_ADMIN", "REVIEWER", "OPERATIONS_MANAGER", "INSPECTOR", "TECHNICAL", "SHARIA_PANEL"]);

const ROLE_STAGE_GATES: Record<string, Set<string>> = {
  REVIEWER:           new Set(["SUBMITTED", "SCREENING", "DEFICIENCY_NOTICE"]),
  OPERATIONS_MANAGER: new Set(["ELIGIBILITY_REVIEW", "TRC_ESCALATION", "AWAITING_PAYMENT"]),
  INSPECTOR:          new Set(["PENDING_AUDIT", "AUDITING", "ACTION_REQUIRED_NCR", "VERIFYING_NCR"]),
  TECHNICAL:          new Set(["BOARD_REVIEW"]),
  SHARIA_PANEL:       new Set(["BOARD_REVIEW"]),
};

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const role   = (session.user as { role?: string }).role;
  const { appId } = await params;

  const application = await prisma.certificationApplication.findUnique({
    where: { id: appId },
    include: { certificate: true, payments: true },
  });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = application.userId === userId;
  const isStaff = STAFF_WRITE_ROLES.has(role ?? "");
  if (!isOwner && !isStaff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ application });
}

const ALL_STATUSES = [
  "DRAFT", "SUBMITTED", "SCREENING", "DEFICIENCY_NOTICE",
  "ELIGIBILITY_REVIEW", "TRC_ESCALATION", "AWAITING_PAYMENT",
  "PENDING_AUDIT", "AUDITING", "ACTION_REQUIRED_NCR",
  "VERIFYING_NCR", "BOARD_REVIEW", "CERTIFIED", "REJECTED",
  "CLOSED_INCOMPLETE",
] as const;

const staffUpdateSchema = z.object({
  status:           z.enum(ALL_STATUSES).optional(),
  certIssueMode:    z.enum(["ON_APPROVAL", "ON_PAYMENT", "MANUAL"]).optional(),
  reviewNotes:      z.string().optional(),
  deficiencyNotes:  z.string().optional(),
  ncrReport:        z.string().optional(),
  auditDate:        z.string().optional(),
  feeAmountNgn:     z.number().int().positive().optional(),
  feeDescription:   z.string().min(1).optional(),
  issueCertificate: z.boolean().optional(),
  checklistData:    z.string().optional(),
  deficiencyItems:  z.string().optional(),
  auditTeam:        z.string().optional(),
  ncSeverity:       z.string().optional(),
});

const userActionSchema = z.object({
  action:        z.enum(["submit", "submitNcrEvidence", "submitCarResponse", "rescheduleAudit"]),
  carResponse:   z.string().optional(),
  newAuditDate:  z.string().optional(),
});

const RESCHEDULE_CUTOFF_DAYS = 3;

const draftSchema = z.object({
  businessName:        z.string().min(1).max(160).optional(),
  sector:              z.string().min(1).max(120).optional(),
  schemeCode:          z.enum(["FB", "FP", "AQ", "SL", "CS", "PH", "CG", "LG"]).optional(),
  productionScale:     z.enum(["LARGE", "MEDIUM", "SMALL"]).optional(),
  productList:         z.string().optional(),
  notes:               z.string().optional(),
  businessRegNo:       z.string().optional(),
  entityType:          z.string().optional(),
  headOfficeAddress:   z.string().optional(),
  factoryAddress:      z.string().optional(),
  telephone:           z.string().optional(),
  website:             z.string().optional(),
  picName:             z.string().optional(),
  picDesignation:      z.string().optional(),
  picPhone:            z.string().optional(),
  picEmail:            z.string().optional(),
  ingredientList:      z.string().optional(),
  otherCertifications: z.string().optional(),
  declarationAccepted: z.boolean().optional(),
});

async function generateReferenceNumber(appId: string, schemeCode: string): Promise<string> {
  const year = new Date().getFullYear().toString().slice(-2);
  const prefix = `DAHC/${year}/${schemeCode}/`;
  const existing = await prisma.certificationApplication.findMany({
    where: { referenceNumber: { startsWith: `DAHC/${year}/` }, id: { not: appId } },
    select: { referenceNumber: true },
  });
  let maxSeq = 0;
  for (const app of existing) {
    if (!app.referenceNumber) continue;
    const parts = app.referenceNumber.split("/");
    const seq = parseInt(parts[3] ?? "0", 10);
    if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
  }
  return `${prefix}${String(maxSeq + 1).padStart(4, "0")}`;
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId  = (session.user as { id: string }).id;
  const role    = (session.user as { role?: string }).role ?? "";

  const { appId } = await params;
  const body = await req.json().catch(() => null);

  const application = await prisma.certificationApplication.findUnique({
    where: { id: appId },
    select: {
      id: true, userId: true, status: true, schemeCode: true, referenceNumber: true,
      applicationNumber: true, businessName: true, ncrReport: true, ncSeverity: true,
      auditDate: true, auditTeam: true, deficiencyItems: true,
      user: { select: { name: true, email: true } },
    },
  });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner     = application.userId === userId;
  const isFullAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const isStaff     = STAFF_WRITE_ROLES.has(role);

  // ── Owner section ─────────────────────────────────────────────────────────────
  if (!isStaff && isOwner) {
    if (body?.action) {
      const parsed = userActionSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

      if (parsed.data.action === "submit") {
        if (application.status !== "DRAFT") {
          return NextResponse.json({ error: "Only DRAFT applications can be submitted" }, { status: 400 });
        }
        const updated = await prisma.certificationApplication.update({
          where: { id: appId }, data: { status: "SUBMITTED" },
        });
        // Fire-and-forget email to applicant
        if (application.user?.email) {
          emailApplicationReceived(
            application.user.email,
            application.user.name ?? "Applicant",
            application.applicationNumber ?? appId.slice(0, 8),
            application.businessName,
          ).catch(() => {});
        }
        return NextResponse.json({ application: updated });
      }

      if (parsed.data.action === "submitNcrEvidence") {
        if (application.status !== "ACTION_REQUIRED_NCR") {
          return NextResponse.json({ error: "Application is not awaiting NCR evidence" }, { status: 400 });
        }
        const updated = await prisma.certificationApplication.update({
          where: { id: appId }, data: { status: "VERIFYING_NCR" },
        });
        return NextResponse.json({ application: updated });
      }

      if (parsed.data.action === "submitCarResponse") {
        if (application.status !== "ACTION_REQUIRED_NCR") {
          return NextResponse.json({ error: "Application is not awaiting corrective action response" }, { status: 400 });
        }
        if (!parsed.data.carResponse) {
          return NextResponse.json({ error: "carResponse is required" }, { status: 400 });
        }
        const updated = await prisma.certificationApplication.update({
          where: { id: appId },
          data: { carResponse: parsed.data.carResponse, status: "VERIFYING_NCR" },
        });
        return NextResponse.json({ application: updated });
      }

      if (parsed.data.action === "rescheduleAudit") {
        if (application.status !== "PENDING_AUDIT") {
          return NextResponse.json({ error: "Audits can only be rescheduled while awaiting the on-site visit" }, { status: 400 });
        }
        if (!application.auditDate) {
          return NextResponse.json({ error: "No audit date has been scheduled yet — contact DAHC to arrange one" }, { status: 400 });
        }
        if (!parsed.data.newAuditDate) {
          return NextResponse.json({ error: "newAuditDate is required" }, { status: 400 });
        }
        const now = new Date();
        const cutoff = new Date(application.auditDate);
        cutoff.setDate(cutoff.getDate() - RESCHEDULE_CUTOFF_DAYS);
        if (now >= cutoff) {
          return NextResponse.json({
            error: `This audit is less than ${RESCHEDULE_CUTOFF_DAYS} days away and can no longer be self-rescheduled. Please contact DAHC directly at inspection@daralhalalcertification.com.`,
          }, { status: 400 });
        }
        const newDate = new Date(parsed.data.newAuditDate);
        if (isNaN(newDate.getTime()) || newDate <= now) {
          return NextResponse.json({ error: "Please choose a valid future date" }, { status: 400 });
        }
        const updated = await prisma.certificationApplication.update({
          where: { id: appId }, data: { auditDate: newDate },
        });
        if (application.user?.email) {
          emailAuditScheduled(
            application.user.email,
            application.user.name ?? "Applicant",
            application.applicationNumber ?? appId.slice(0, 8),
            newDate.toISOString(),
            application.auditTeam ?? undefined,
          ).catch(() => {});
        }
        return NextResponse.json({ application: updated });
      }

      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    // DRAFT field update
    if (application.status === "DRAFT") {
      const parsed = draftSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
      const updated = await prisma.certificationApplication.update({
        where: { id: appId }, data: parsed.data,
      });
      return NextResponse.json({ application: updated });
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ── Staff-only ────────────────────────────────────────────────────────────────
  if (!isStaff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = staffUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  if (!isFullAdmin) {
    const gate = ROLE_STAGE_GATES[role];
    if (gate && !gate.has(application.status)) {
      return NextResponse.json({ error: "This role cannot act on applications in the current stage" }, { status: 403 });
    }
    if (role === "TECHNICAL" && parsed.data.status) {
      return NextResponse.json({ error: "Technical role may only add notes at Board Review stage" }, { status: 403 });
    }
    if (role === "SHARIA_PANEL" && parsed.data.status && !["CERTIFIED", "REJECTED"].includes(parsed.data.status)) {
      return NextResponse.json({ error: "Sharia Panel may only Certify or Reject at Board Review stage" }, { status: 403 });
    }
    if (["REVIEWER", "INSPECTOR", "OPERATIONS_MANAGER"].includes(role) && parsed.data.status === "CERTIFIED") {
      return NextResponse.json({ error: `${role} cannot certify applications` }, { status: 403 });
    }
  }

  const { feeAmountNgn, feeDescription, issueCertificate, auditDate, ...applicationFields } = parsed.data;

  let referenceNumber: string | undefined;
  if (parsed.data.status === "ELIGIBILITY_REVIEW" && !application.referenceNumber) {
    referenceNumber = await generateReferenceNumber(appId, application.schemeCode ?? "FB");
  }

  let certExpiryDate: string | undefined;
  if (parsed.data.status === "CERTIFIED") {
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    certExpiryDate = expiry.toISOString();
  }

  const updatedApp = await prisma.certificationApplication.update({
    where: { id: appId },
    data: {
      ...applicationFields,
      ...(referenceNumber ? { referenceNumber } : {}),
      ...(auditDate       ? { auditDate: new Date(auditDate) } : {}),
      ...(certExpiryDate  ? { certExpiryDate } : {}),
      reviewedBy: userId,
    },
  });

  if (feeAmountNgn) {
    await prisma.payment.create({
      data: {
        userId:        updatedApp.userId,
        applicationId: updatedApp.id,
        amount:        feeAmountNgn * 100,
        currency:      "NGN",
        description:   feeDescription || `Certification fee — ${updatedApp.businessName}`,
      },
    });
  }

  let certificate = null;
  if (updatedApp.status === "CERTIFIED") {
    certificate = await issueApplicationCertificateIfNeeded(updatedApp.id).catch(() => null);
  }

  // Fire-and-forget notification emails on status change — plus a resend whenever the
  // audit date itself is set or moved while the application stays in PENDING_AUDIT, so
  // the applicant always has an email reflecting the actual scheduled date (not just the
  // date at the moment the stage first changed).
  const statusChanged = !!parsed.data.status && parsed.data.status !== application.status;
  const auditDateChanged = !!auditDate && (
    !application.auditDate || auditDate.slice(0, 10) !== new Date(application.auditDate).toISOString().slice(0, 10)
  );
  const shouldNotify = statusChanged || (updatedApp.status === "PENDING_AUDIT" && auditDateChanged);

  if (shouldNotify && application.user?.email) {
    const { email: toEmail, name: toName } = application.user;
    const appNum = application.applicationNumber ?? appId.slice(0, 8);
    const bizName = application.businessName;
    const newStatus = parsed.data.status ?? application.status;

    (async () => {
      try {
        if (newStatus === "DEFICIENCY_NOTICE") {
          let items: string[] = [];
          try { items = (JSON.parse(parsed.data.deficiencyItems ?? application.deficiencyItems ?? "[]") as { label: string }[]).map(i => i.label); } catch {}
          await emailDeficiencyNotice(toEmail, toName ?? "Applicant", appNum, items);
        } else if (newStatus === "AWAITING_PAYMENT") {
          const fee = feeAmountNgn ? feeAmountNgn : undefined;
          await emailEligibleAwaitingPayment(toEmail, toName ?? "Applicant", appNum, bizName, fee);
        } else if (newStatus === "PENDING_AUDIT") {
          await emailAuditScheduled(toEmail, toName ?? "Applicant", appNum,
            auditDate ?? (application.auditDate ? String(application.auditDate) : undefined),
            parsed.data.auditTeam ?? application.auditTeam ?? undefined);
        } else if (newStatus === "ACTION_REQUIRED_NCR") {
          await emailNcrIssued(toEmail, toName ?? "Applicant", appNum,
            parsed.data.ncSeverity ?? application.ncSeverity ?? "MINOR",
            parsed.data.ncrReport ?? application.ncrReport ?? "");
        } else if (newStatus === "CERTIFIED" && certificate) {
          await emailCertified(toEmail, toName ?? "Applicant", bizName, certificate.serial,
            certExpiryDate ?? undefined);
        } else if (newStatus === "REJECTED") {
          await emailRejected(toEmail, toName ?? "Applicant", bizName, parsed.data.reviewNotes ?? "");
        }
      } catch { /* email failure must not affect response */ }
    })();
  }

  return NextResponse.json({ application: updatedApp, certificate });
}
