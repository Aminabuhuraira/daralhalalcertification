import { prisma } from "@/lib/db";
import AdminApplicationList from "@/components/dashboard/AdminApplicationList";
import ApplicationCharts from "@/components/dashboard/ApplicationCharts";
import { getApplicationChartData } from "@/lib/application-stats";

export default async function AdminApplicationsPage() {
  const [applications, chartData] = await Promise.all([
    prisma.certificationApplication.findMany({
      include: { user: { select: { name: true, email: true } }, payments: true, certificate: true },
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
    getApplicationChartData().catch(() => ({ statusCounts: [], sectorCounts: [], monthlyCounts: [], categoryCounts: [], total: 0 })),
  ]);

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, color: "#0A1535", marginBottom: 6 }}>
        Certification Applications
      </h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.5)", marginBottom: 32 }}>
        Review applications, leave notes, and issue fee invoices.
      </p>
      <ApplicationCharts {...chartData} />
      <AdminApplicationList applications={applications} />
    </div>
  );
}
