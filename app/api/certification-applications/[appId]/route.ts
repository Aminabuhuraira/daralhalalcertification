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
  const role = (session.user as { role?: string }).role;
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

const updateSchema = z.object({
  status: z.enum(["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"]).optional(),
  certIssueMode: z.enum(["ON_APPROVAL", "ON_PAYMENT", "MANUAL"]).optional(),
  reviewNotes: z.string().optional(),
  feeAmountNgn: z.number().int().positive().optional(),
  feeDescription: z.string().min(1).optional(),
  issueCertificate: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { appId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }
  const { feeAmountNgn, feeDescription, issueCertificate, ...applicationFields } = parsed.data;

  const application = await prisma.certificationApplication.update({
    where: { id: appId },
    data: { ...applicationFields, reviewedBy: (session.user as { id: string }).id },
  });

  if (feeAmountNgn) {
    await prisma.payment.create({
      data: {
        userId: application.userId,
        applicationId: application.id,
        amount: feeAmountNgn * 100,
        currency: "NGN",
        description: feeDescription || `Certification fee — ${application.businessName}`,
      },
    });
  }

  // Auto-issue when the application is (now) Approved and configured to issue on approval.
  // The admin can also force issuance immediately via issueCertificate, regardless of mode,
  // as long as the application has been approved.
  let certificate = null;
  if (application.status === "APPROVED" && (application.certIssueMode === "ON_APPROVAL" || issueCertificate)) {
    certificate = await issueApplicationCertificateIfNeeded(application.id);
  }

  return NextResponse.json({ application, certificate });
}
