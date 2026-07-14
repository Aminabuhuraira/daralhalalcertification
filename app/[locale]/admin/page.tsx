import { Building2, ShieldCheck, Package, Bell, Boxes } from "lucide-react";
import { ensureDb, prisma } from "@/lib/db";
import StatTile from "@/components/dashboard/StatTile";
import AdminOverviewCharts from "@/components/dashboard/AdminOverviewCharts";
import AdminPaymentPanel from "@/components/dashboard/AdminPaymentPanel";
import { getAdminDashboardStats } from "@/lib/admin-dashboard-stats";

export default async function AdminOverviewPage() {
  await ensureDb();

  const stats = await getAdminDashboardStats().catch(() => ({
    totalCompanies: 0,
    certifiedCount: 0,
    verifiedProductsCount: 0,
    renewalAlerts: 0,
    allProductsCount: 0,
    scaleCounts: [],
    statusCounts: [],
    upcomingRenewals: [],
    recentPayments: [],
  }));

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "#0A1535", marginBottom: 4 }}>
          Admin Overview
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.45)" }}>
          Platform-wide activity at a glance.
        </p>
      </div>

      {/* ── Stat strip ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 20 }}>
        <StatTile icon={<Building2 size={17} />}   label="Total Companies"     value={stats.totalCompanies}        accent="#0A1535" />
        <StatTile icon={<ShieldCheck size={17} />} label="Certified Companies" value={stats.certifiedCount}        accent="#16A34A" />
        <StatTile icon={<Package size={17} />}     label="Verified Products"   value={stats.verifiedProductsCount} accent="#C9A227" />
        <StatTile icon={<Bell size={17} />}        label="Renewal Alerts"      value={stats.renewalAlerts}         accent="#DC2626" />
        <StatTile icon={<Boxes size={17} />}       label="All Products"        value={stats.allProductsCount}      accent="#6D28D9" />
      </div>

      {/* ── Charts ── */}
      <div style={{ marginBottom: 20 }}>
        <AdminOverviewCharts
          scaleCounts={stats.scaleCounts}
          statusCounts={stats.statusCounts}
        />
      </div>

      {/* ── Payments + Renewals ── */}
      <AdminPaymentPanel
        recentPayments={stats.recentPayments}
        upcomingRenewals={stats.upcomingRenewals}
      />
    </div>
  );
}
