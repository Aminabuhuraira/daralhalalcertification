import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { issueApplicationCertificateIfNeeded } from "@/lib/certificates";

type Params = { params: Promise<{ appId: string }> };

// Roles that have any staff-level write access
const STAFF_WRITE_ROLES = new Set(["ADMIN", "SUPER_ADMIN", "REVIEWER", "OPERATIONS_MANAGER", "INSPECTOR", "TECHNICAL", "SHARIA_PANEL"]);

// Which statuses each staff role can advance FROM (undefined = no restriction for full-access roles)
const ROLE_STAGE_GATES: Record<string, Set<string>> = {
  REVIEWER: new Set(["SUBMITTED", "SCREENING", "DEFICIENCY_NOTICE"]),
  OPERATIONS_MANAGER: new Set(["ELIGIBILITY_REVIEW", "TRC_ESCALATION", "AWAITING_PAYMENT"]),
  INSPECTOR: new Set(["PENDING_AUDIT", "AUDITING", "ACTION_REQUIRED_NCR", "VERIFYING_NCR"]),
  TECHNICAL: new Set(["BOARD_REVIEW"]),   // notes only — no status transitions
  SHARIA_PANEL: new Set(["BOARD_REVIEW"]),
};

// Status transitions allowed per destination status (by role)
const TECHNICAL_READONLY_STATUSES = new Set<string>(["BOARD_REVIEW"]); // TECHNICAL can only add notes here

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
  if (!isOwner && !isStaff) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
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
});

// User-facing: submit draft or confirm NCR evidence submitted
const userActionSchema = z.object({
  action: z.enum(["submit", "submitNcrEvidence"]),
});

async function generateReferenceNumber(appId: string, schemeCode: string): Promise<string> {
  const year = new Date().getFullYear().toString().slice(-2);
  const prefix = `DAHC/${year}/${schemeCode}/`;

  const existing = await prisma.certificationApplication.findMany({
    where: {
      referenceNumber: { startsWith: `DAHC/${year}/` },
      id: { not: appId },
    },
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
  const userId = (session.user as { id: string }).id;
  const role   = (session.user as { role?: string }).role ?? "";

  const { appId } = await params;
  const body = await req.json().catch(() => null);

  const application = await prisma.certificationApplication.findUnique({
    where: { id: appId },
    select: { id: true, userId: true, status: true, schemeCode: true, referenceNumber: true },
  });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = application.userId === userId;
  const isFullAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const isStaff = STAFF_WRITE_ROLES.has(role);

  // ── User-facing actions ──────────────────────────────────────────────────────
  if (!isStaff && isOwner) {
    const parsed = userActionSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    if (parsed.data.action === "submit") {
      if (application.status !== "DRAFT") {
        return NextResponse.json({ error: "Only DRAFT applications can be submitted" }, { status: 400 });
      }
      const updated = await prisma.certificationApplication.update({
        where: { id: appId },
        data: { status: "SUBMITTED" },
      });
      return NextResponse.json({ application: updated });
    }

    if (parsed.data.action === "submitNcrEvidence") {
      if (application.status !== "ACTION_REQUIRED_NCR") {
        return NextResponse.json({ error: "Application is not awaiting NCR evidence" }, { status: 400 });
      }
      const updated = await prisma.certificationApplication.update({
        where: { id: appId },
        data: { status: "VERIFYING_NCR" },
      });
      return NextResponse.json({ application: updated });
    }
  }

  // ── User updating their own DRAFT fields ────────────────────────────────────
  if (isOwner && !isStaff && application.status === "DRAFT") {
    const draftSchema = z.object({
      businessName:    z.string().min(1).max(160).optional(),
      sector:          z.string().min(1).max(120).optional(),
      schemeCode:      z.enum(["FB", "FP", "AQ", "SL", "CS", "PH", "CG", "LG"]).optional(),
      productionScale: z.enum(["LARGE", "MEDIUM", "SMALL"]).optional(),
      productList:     z.string().min(1).optional(),
      notes:           z.string().optional(),
    });
    const parsed = draftSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const updated = await prisma.certificationApplication.update({
      where: { id: appId },
      data: parsed.data,
    });
    return NextResponse.json({ application: updated });
  }

  // ── Staff-only actions below ─────────────────────────────────────────────────
  if (!isStaff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = staffUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  // Gate non-full-admins to their allowed stages
  if (!isFullAdmin) {
    const gate = ROLE_STAGE_GATES[role];
    if (gate && !gate.has(application.status)) {
      return NextResponse.json({ error: "This role cannot act on applications in the current stage" }, { status: 403 });
    }
    // TECHNICAL role can only add notes — no status changes
    if (role === "TECHNICAL" && parsed.data.status) {
      return NextResponse.json({ error: "Technical role may only add notes at Board Review stage" }, { status: 403 });
    }
    // SHARIA_PANEL can only approve or reject from BOARD_REVIEW
    if (role === "SHARIA_PANEL" && parsed.data.status) {
      if (!["CERTIFIED", "REJECTED"].includes(parsed.data.status)) {
        return NextResponse.json({ error: "Sharia Panel may only Certify or Reject at Board Review stage" }, { status: 403 });
      }
    }
    // REVIEWER cannot certify
    if (role === "REVIEWER" && parsed.data.status === "CERTIFIED") {
      return NextResponse.json({ error: "Reviewer cannot certify applications" }, { status: 403 });
    }
    // INSPECTOR cannot certify
    if (role === "INSPECTOR" && parsed.data.status === "CERTIFIED") {
      return NextResponse.json({ error: "Inspector cannot certify applications" }, { status: 403 });
    }
    // OPERATIONS_MANAGER cannot certify
    if (role === "OPERATIONS_MANAGER" && parsed.data.status === "CERTIFIED") {
      return NextResponse.json({ error: "Operations Manager cannot certify applications" }, { status: 403 });
    }
  }

  const { feeAmountNgn, feeDescription, issueCertificate, auditDate, ...applicationFields } = parsed.data;

  // Auto-generate reference number on ELIGIBILITY_REVIEW transition
  let referenceNumber: string | undefined;
  if (parsed.data.status === "ELIGIBILITY_REVIEW" && !application.referenceNumber) {
    const code = application.schemeCode ?? "FB";
    referenceNumber = await generateReferenceNumber(appId, code);
  }

  const updatedApp = await prisma.certificationApplication.update({
    where: { id: appId },
    data: {
      ...applicationFields,
      ...(referenceNumber ? { referenceNumber } : {}),
      ...(auditDate ? { auditDate: new Date(auditDate) } : {}),
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
  if (updatedApp.status === "CERTIFIED" && (issueCertificate || true)) {
    certificate = await issueApplicationCertificateIfNeeded(updatedApp.id).catch(() => null);
  }

  return NextResponse.json({ application: updatedApp, certificate });
}
