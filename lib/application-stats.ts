import { prisma } from "@/lib/db";

export type StatusCount = { status: string; count: number };
export type SectorCount = { sector: string; count: number };
export type MonthCount = { month: string; count: number };
export type CategoryCount = { category: string; count: number };

const STATUS_ORDER = [
  "SUBMITTED", "SCREENING", "DEFICIENCY_NOTICE", "ELIGIBILITY_REVIEW",
  "TRC_ESCALATION", "AWAITING_PAYMENT", "PENDING_AUDIT", "AUDITING",
  "ACTION_REQUIRED_NCR", "VERIFYING_NCR", "BOARD_REVIEW",
  "CERTIFIED", "REJECTED", "CLOSED_INCOMPLETE",
] as const;

export async function getApplicationChartData() {
  const [statusGroups, sectorGroups, all, courseRows] = await Promise.all([
    prisma.certificationApplication.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.certificationApplication.groupBy({ by: ["sector"], _count: { _all: true } }),
    prisma.certificationApplication.findMany({ select: { createdAt: true } }),
    prisma.course.findMany({ select: { category: true, _count: { select: { enrollments: true } } } }),
  ]);

  const catMap = new Map<string, number>();
  for (const c of courseRows) {
    catMap.set(c.category, (catMap.get(c.category) ?? 0) + c._count.enrollments);
  }
  const categoryCounts: CategoryCount[] = [...catMap.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  // Only include statuses that have data
  const statusCounts: StatusCount[] = STATUS_ORDER
    .map((status) => ({
      status,
      count: statusGroups.find((g) => g.status === status)?._count._all ?? 0,
    }))
    .filter(s => s.count > 0);

  const sortedSectors = [...sectorGroups].sort((a, b) => b._count._all - a._count._all);
  const TOP_N = 6;
  const topSectors = sortedSectors.slice(0, TOP_N);
  const otherCount = sortedSectors.slice(TOP_N).reduce((sum, g) => sum + g._count._all, 0);
  const sectorCounts: SectorCount[] = [
    ...topSectors.map((g) => ({ sector: g.sector, count: g._count._all })),
    ...(otherCount > 0 ? [{ sector: "Other", count: otherCount }] : []),
  ];

  const now = new Date();
  const monthBuckets: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthBuckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("en-US", { month: "short" }),
    });
  }
  const counts = new Map(monthBuckets.map((b) => [b.key, 0]));
  for (const app of all) {
    const d = new Date(app.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (counts.has(key)) counts.set(key, (counts.get(key) || 0) + 1);
  }
  const monthlyCounts: MonthCount[] = monthBuckets.map((b) => ({ month: b.label, count: counts.get(b.key) || 0 }));

  return { statusCounts, sectorCounts, monthlyCounts, categoryCounts, total: all.length };
}
