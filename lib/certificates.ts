import { prisma } from "@/lib/db";
import type { CertTier } from "@prisma/client";

async function nextSerial() {
  const year = new Date().getFullYear();
  const count = await prisma.certificate.count();
  return `DHC-${year}-${String(count + 1).padStart(6, "0")}`;
}

export async function issueCertificateIfNeeded(userId: string, courseId: string, tier: CertTier) {
  const existing = await prisma.certificate.findUnique({
    where: { userId_courseId_tier: { userId, courseId, tier } },
  });
  if (existing) return existing;

  return prisma.certificate.create({
    data: { userId, courseId, tier, serial: await nextSerial() },
  });
}

/**
 * Issues the verifiable business halal certificate for an approved certification
 * application. Idempotent — safe to call from multiple trigger points (approval,
 * payment confirmation, manual admin action) since one certificate per application
 * is enforced by the unique applicationId constraint.
 */
export async function issueApplicationCertificateIfNeeded(applicationId: string) {
  const existing = await prisma.certificate.findUnique({ where: { applicationId } });
  if (existing) return existing;

  const application = await prisma.certificationApplication.findUnique({ where: { id: applicationId } });
  if (!application) throw new Error("Application not found");

  return prisma.certificate.create({
    data: { userId: application.userId, applicationId, tier: "BUSINESS", serial: await nextSerial() },
  });
}

/**
 * Called after a Payment tied to a CertificationApplication is confirmed COMPLETED
 * (via Paystack webhook or callback). Issues the certificate only if the admin
 * configured this application to issue on payment, and compliance was approved.
 */
export async function maybeIssueOnPaymentCompleted(applicationId: string | null) {
  if (!applicationId) return null;
  const application = await prisma.certificationApplication.findUnique({ where: { id: applicationId } });
  if (!application) return null;
  if (application.status !== "APPROVED" || application.certIssueMode !== "ON_PAYMENT") return null;
  return issueApplicationCertificateIfNeeded(applicationId);
}
