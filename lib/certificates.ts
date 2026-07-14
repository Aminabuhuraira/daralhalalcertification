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

export async function issueApplicationCertificateIfNeeded(applicationId: string) {
  const existing = await prisma.certificate.findUnique({ where: { applicationId } });
  if (existing) return existing;

  const application = await prisma.certificationApplication.findUnique({ where: { id: applicationId } });
  if (!application) throw new Error("Application not found");

  return prisma.certificate.create({
    data: { userId: application.userId, applicationId, tier: "BUSINESS", serial: await nextSerial() },
  });
}

export async function maybeIssueOnPaymentCompleted(applicationId: string | null) {
  if (!applicationId) return null;
  const application = await prisma.certificationApplication.findUnique({ where: { id: applicationId } });
  if (!application) return null;
  // In the new workflow, payment confirmation moves app to PENDING_AUDIT — certs are only
  // issued when an admin explicitly transitions to CERTIFIED via the board approval step.
  if (application.status !== "AWAITING_PAYMENT" || application.certIssueMode !== "ON_PAYMENT") return null;
  // Move to PENDING_AUDIT on confirmed payment
  await prisma.certificationApplication.update({
    where: { id: applicationId },
    data: { status: "PENDING_AUDIT" },
  });
  return null;
}
