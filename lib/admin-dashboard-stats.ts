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

// Groups many workflow states into chart-friendly buckets
const STATUS_BUCKET: Record<string, string> = {
  DRAFT:                "Pending",
  SUBMITTED:            "Pending",
  SCREENING:            "Pending",
  DEFICIENCY_NOTICE:    "Pending",
  ELIGIBILITY_REVIEW:   "Pending",
  TRC_ESCALATION:       "Pending",
  AWAITING_PAYMENT:     "Pending",
  PENDING_AUDIT:        "Pending",
  AUDITING:             "Pending",
  ACTION_REQUIRED_NCR:  "Pending",
  VERIFYING_NCR:        "Pending",
  BOARD_REVIEW:         "Pending",
  CERTIFIED:            "Certified",
  REJECTED:             "Rejected",
  CLOSED_INCOMPLETE:    "Closed",
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
    prisma.certificationApplication.count({ where: { status: "CERTIFIED" } }),
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
  const allProductsCount = applications.reduce((s, a) => s + countProducts(a.productList), 0);
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

  // Company Status breakdown — aggregate new states into buckets
  const bucketMap = new Map<string, number>();
  for (const a of applications) {
    const bucket = STATUS_BUCKET[a.status] ?? "Pending";
    bucketMap.set(bucket, (bucketMap.get(bucket) ?? 0) + 1);
  }
  const statusCounts: StatusCount[] = [...bucketMap.entries()].map(([status, count]) => ({
    status,
    count,
    label: status,
  }));

  // Upcoming renewals
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
