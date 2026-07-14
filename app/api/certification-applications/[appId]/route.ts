import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { issueApplicationCertificateIfNeeded } from "@/lib/certificates";

type Params = { params: Promise<{ appId: string }> };

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
  if (application.userId !== userId && role !== "ADMIN") {
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

const updateSchema = z.object({
  status:           z.enum(ALL_STATUSES).optional(),
  certIssueMode:    z.enum(["ON_APPROVAL", "ON_PAYMENT", "MANUAL"]).optional(),
  reviewNotes:      z.string().optional(),
  deficiencyNotes:  z.string().optional(),
  auditDate:        z.string().optional(),
  feeAmountNgn:     z.number().int().positive().optional(),
  feeDescription:   z.string().min(1).optional(),
  issueCertificate: z.boolean().optional(),
});

async function generateReferenceNumber(appId: string, schemeCode: string): Promise<string> {
  const year = new Date().getFullYear().toString().slice(-2);
  const prefix = `DAHC/${year}/${schemeCode}/`;

  // Find max existing sequence for this year (across all schemes)
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
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { appId } = await params;
  const body   = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  const { feeAmountNgn, feeDescription, issueCertificate, auditDate, ...applicationFields } = parsed.data;

  // Auto-generate reference number when transitioning to ELIGIBILITY_REVIEW
  let referenceNumber: string | undefined;
  if (parsed.data.status === "ELIGIBILITY_REVIEW") {
    const current = await prisma.certificationApplication.findUnique({
      where: { id: appId },
      select: { referenceNumber: true, schemeCode: true },
    });
    if (!current?.referenceNumber) {
      const code = current?.schemeCode ?? "FB";
      referenceNumber = await generateReferenceNumber(appId, code);
    }
  }

  const application = await prisma.certificationApplication.update({
    where: { id: appId },
    data: {
      ...applicationFields,
      ...(referenceNumber ? { referenceNumber } : {}),
      ...(auditDate ? { auditDate: new Date(auditDate) } : {}),
      reviewedBy: (session.user as { id: string }).id,
    },
  });

  if (feeAmountNgn) {
    await prisma.payment.create({
      data: {
        userId:        application.userId,
        applicationId: application.id,
        amount:        feeAmountNgn * 100,
        currency:      "NGN",
        description:   feeDescription || `Certification fee — ${application.businessName}`,
      },
    });
  }

  // Issue certificate when explicitly transitioning to CERTIFIED
  let certificate = null;
  if (application.status === "CERTIFIED" && (issueCertificate || true)) {
    certificate = await issueApplicationCertificateIfNeeded(application.id).catch(() => null);
  }

  return NextResponse.json({ application, certificate });
}
