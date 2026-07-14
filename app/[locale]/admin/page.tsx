import { Users, BookOpen, Award, ClipboardCheck, GraduationCap } from "lucide-react";
import { prisma } from "@/lib/db";
import StatTile from "@/components/dashboard/StatTile";
import ApplicationCharts from "@/components/dashboard/ApplicationCharts";
import { getApplicationChartData } from "@/lib/application-stats";

export default async function AdminOverviewPage() {
  const [userCount, enrollmentCount, certificateCount, pendingApplications, courseCount, chartData] = await Promise.all([
    prisma.user.count().catch(() => 0),
    prisma.enrollment.count().catch(() => 0),
    prisma.certificate.count().catch(() => 0),
    prisma.certificationApplication.count({ where: { status: "PENDING" } }).catch(() => 0),
    prisma.course.count().catch(() => 0),
    getApplicationChartData().catch(() => ({ statusCounts: [], sectorCounts: [], monthlyCounts: [], categoryCounts: [], total: 0 })),
  ]);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "#0A1535", marginBottom: 4 }}>
          Admin Overview
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.45)" }}>
          Platform-wide activity at a glance.
        </p>
      </div>

      {/* ── Stat strip ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 28 }}>
        <StatTile icon={<Users size={17} />}          label="Total Users"          value={userCount}            accent="#0A1535" />
        <StatTile icon={<GraduationCap size={17} />}  label="Enrollments"          value={enrollmentCount}      accent="#2563EB" />
        <StatTile icon={<Award size={17} />}          label="Certificates"         value={certificateCount}     accent="#C9A227" />
        <StatTile icon={<ClipboardCheck size={17} />} label="Pending Applications" value={pendingApplications}  accent="#D97706" />
        <StatTile icon={<BookOpen size={17} />}       label="Courses"              value={courseCount}          accent="#16A34A" />
      </div>

      {/* ── Charts ── */}
      <ApplicationCharts {...chartData} />
    </div>
  );
}
