import { prisma } from "@/lib/db";

export type ScaleCount   = { scale: string; count: number };
export type StatusCount  = { status: string; count: number; label: string };
export type PaymentTotals = { companyTotal: number; productTotal: number; overall: number };
export type RenewalRow   = {
  id: string;
  businessName: string;
  productList: string;
  type: string;
  serial: string;
  issuedAt: Date;
  expiresAt: Date | null;
};
export type RecentPayment = {
  id: string;
  businessName: string | null;
  description: string;
  paymentType: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
};

const SCALE_LABEL: Record<string, string> = {
  LARGE: "Large Scale",
  MEDIUM: "Medium Scale",
  SMALL: "Small Scale",
};
const STATUS_LABEL: Record<string, string> = {
  APPROVED:     "Verified",
  PENDING:      "Pending",
  UNDER_REVIEW: "Under Review",
  REJECTED:     "Rejected",
};

function countProducts(productList: string): number {
  return productList.split(/[,\n]/).map(s => s.trim()).filter(Boolean).length;
}

export async function getAdminDashboardStats() {
  const [
    applications,
    certifiedCount,
    renewalAlerts,
    recentCerts,
    recentPayments,
  ] = await Promise.all([
    prisma.certificationApplication.findMany({
      select: { id: true, status: true, productionScale: true, productList: true, businessName: true, createdAt: true },
    }),
    prisma.certificationApplication.count({ where: { status: "APPROVED" } }),
    prisma.certificate.count({
      where: {
        tier: "BUSINESS",
        expiresAt: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.certificate.findMany({
      where: { tier: "BUSINESS", expiresAt: { not: null } },
      include: { application: { select: { businessName: true, productList: true } } },
      orderBy: { expiresAt: "asc" },
      take: 10,
    }),
    prisma.payment.findMany({
      include: { application: { select: { businessName: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const totalCompanies = applications.length;
  // "All Products" = total product line items submitted across every application
  const allProductsCount = applications.reduce((s, a) => s + countProducts(a.productList), 0);
  // "Verified Products" = certificates of BUSINESS tier that have actually been issued
  const verifiedProductsCount = await prisma.certificate.count({ where: { tier: "BUSINESS" } });

  // Production Scale breakdown
  const scaleMap = new Map<string, number>();
  for (const a of applications) {
    const k = a.productionScale ?? "UNSET";
    scaleMap.set(k, (scaleMap.get(k) ?? 0) + 1);
  }
  const scaleCounts: ScaleCount[] = ["LARGE", "MEDIUM", "SMALL"]
    .filter(k => scaleMap.has(k))
    .map(k => ({ scale: SCALE_LABEL[k] ?? k, count: scaleMap.get(k)! }));

  // Company Status breakdown
  const statusMap = new Map<string, number>();
  for (const a of applications) {
    const label = STATUS_LABEL[a.status] ?? a.status;
    statusMap.set(label, (statusMap.get(label) ?? 0) + 1);
  }
  const statusCounts: StatusCount[] = [...statusMap.entries()].map(([status, count]) => ({
    status,
    count,
    label: status,
  }));

  // Upcoming renewals (within 60 days)
  const upcomingRenewals: RenewalRow[] = recentCerts
    .filter(c => c.expiresAt !== null)
    .map(c => ({
      id: c.id,
      businessName: c.application?.businessName ?? "—",
      productList: c.application?.productList ?? "",
      type: "Halal Certification",
      serial: c.serial,
      issuedAt: c.issuedAt,
      expiresAt: c.expiresAt,
    }));

  const recentPaymentRows: RecentPayment[] = recentPayments.map(p => ({
    id: p.id,
    businessName: p.application?.businessName ?? null,
    description: p.description,
    paymentType: p.paymentType,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    createdAt: p.createdAt,
  }));

  return {
    totalCompanies,
    certifiedCount,
    verifiedProductsCount,
    renewalAlerts,
    allProductsCount,
    scaleCounts,
    statusCounts,
    upcomingRenewals,
    recentPayments: recentPaymentRows,
  };
}

export async function getPaymentTotals(startDate?: Date, endDate?: Date): Promise<PaymentTotals> {
  const where = {
    status: "COMPLETED" as const,
    ...(startDate || endDate ? {
      createdAt: {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      },
    } : {}),
  };

  const payments = await prisma.payment.findMany({ where, select: { amount: true, paymentType: true } });

  let companyTotal = 0;
  let productTotal = 0;
  for (const p of payments) {
    if (p.paymentType === "PRODUCT") productTotal += p.amount;
    else companyTotal += p.amount;
  }
  return { companyTotal, productTotal, overall: companyTotal + productTotal };
}
