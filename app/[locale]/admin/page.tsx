import { Building2, ShieldCheck, Package, Bell, Boxes, Users, FilePlus2, ClipboardList, Mail, GraduationCap } from "lucide-react";
import { ensureDb } from "@/lib/db";
import StatTile from "@/components/dashboard/StatTile";
import AdminOverviewCharts from "@/components/dashboard/AdminOverviewCharts";
import ApplicationCharts from "@/components/dashboard/ApplicationCharts";
import AdminPaymentPanel from "@/components/dashboard/AdminPaymentPanel";
import AdminPipelinePanel from "@/components/dashboard/AdminPipelinePanel";
import { getAdminDashboardStats } from "@/lib/admin-dashboard-stats";
import { getApplicationChartData } from "@/lib/application-stats";

export default async function AdminOverviewPage() {
  await ensureDb();

  const [stats, chartData] = await Promise.all([
    getAdminDashboardStats().catch(() => ({
      totalCompanies: 0,
      certifiedCount: 0,
      verifiedProductsCount: 0,
      renewalAlerts: 0,
      allProductsCount: 0,
      scaleCounts: [],
      statusCounts: [],
      pipelineCounts: [],
      actionRequired: [],
      actionRequiredCount: 0,
      upcomingRenewals: [],
      recentPayments: [],
      totalUsers: 0,
      newApplicationsThisWeek: 0,
      newEnquiriesThisWeek: 0,
      totalEnrollments: 0,
      completedEnrollments: 0,
    })),
    getApplicationChartData().catch(() => ({ statusCounts: [], sectorCounts: [], monthlyCounts: [], categoryCounts: [], total: 0 })),
  ]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "#0A1535", marginBottom: 4 }}>
          Admin Overview
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.66)" }}>
          Platform-wide activity at a glance.
        </p>
      </div>

      {/* ── Stat strip: certification pipeline ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 14 }} className="admin-stat-strip">
        <StatTile icon={<Building2 size={17} />}   label="Total Companies"     value={stats.totalCompanies}        accent="#0A1535" />
        <StatTile icon={<ShieldCheck size={17} />} label="Certified Companies" value={stats.certifiedCount}        accent="#16A34A" />
        <StatTile icon={<Package size={17} />}     label="Verified Products"   value={stats.verifiedProductsCount} accent="#C9A227" />
        <StatTile icon={<Bell size={17} />}        label="Renewal Alerts"      value={stats.renewalAlerts}         accent="#DC2626" />
        <StatTile icon={<Boxes size={17} />}       label="All Products"        value={stats.allProductsCount}      accent="#6D28D9" />
      </div>

      {/* ── Stat strip: platform activity ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 20 }} className="admin-stat-strip">
        <StatTile icon={<Users size={17} />}        label="Registered Users"     value={stats.totalUsers}              accent="#2563EB" />
        <StatTile icon={<FilePlus2 size={17} />}    label="New Apps (7 Days)"    value={stats.newApplicationsThisWeek} accent="#0EA5E9" />
        <StatTile icon={<ClipboardList size={17} />} label="Needs DAHC Action"   value={stats.actionRequiredCount}     accent="#F59E0B" />
        <StatTile icon={<Mail size={17} />}         label="New Enquiries (7 Days)" value={stats.newEnquiriesThisWeek} accent="#7C3AED" />
        <StatTile icon={<GraduationCap size={17} />} label="Course Enrollments"  value={stats.totalEnrollments}        accent="#16A34A" />
      </div>

      {/* ── Pipeline breakdown + needs-action queue ── */}
      <div style={{ marginBottom: 20 }}>
        <AdminPipelinePanel
          pipelineCounts={stats.pipelineCounts}
          actionRequired={stats.actionRequired}
        />
      </div>

      {/* ── Charts: full application analytics, matching the Applications tab ── */}
      <div style={{ marginBottom: 16 }}>
        <ApplicationCharts {...chartData} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <AdminOverviewCharts scaleCounts={stats.scaleCounts} />
      </div>

      {/* ── Payments + Renewals ── */}
      <AdminPaymentPanel
        recentPayments={stats.recentPayments}
        upcomingRenewals={stats.upcomingRenewals}
      />
    </div>
  );
}
