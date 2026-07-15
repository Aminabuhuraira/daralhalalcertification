import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Award, ClipboardCheck, ArrowRight, PlayCircle, ChevronRight } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import StatTile from "@/components/dashboard/StatTile";

export default async function DashboardOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/auth/login`);
  const userId = (session.user as { id: string }).id;

  const [enrollments, certificateCount, application] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId },
      include: { course: { include: { modules: { include: { lessons: true } } } }, lessonProgress: true },
      orderBy: { enrolledAt: "desc" },
    }).catch(() => []),
    prisma.certificate.count({ where: { userId } }).catch(() => 0),
    prisma.certificationApplication.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } }).catch(() => null),
  ]);

  const lh = (href: string) => `/${locale}${href}`;
  const completedLessons = enrollments.reduce(
    (sum, e) => sum + e.lessonProgress.filter((p) => p.completed).length,
    0
  );

  const firstName = (session.user as { name?: string }).name?.split(" ")[0] || "there";

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "#0A1535", marginBottom: 4 }}>
          Welcome back, {firstName}
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.45)" }}>
          Here's where your certification journey stands.
        </p>
      </div>

      {/* Stat strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 32 }}>
        <StatTile icon={<BookOpen size={17} />}     label="Enrolled Courses"   value={enrollments.length}  accent="#2563EB" />
        <StatTile icon={<Award size={17} />}        label="Certificates Earned" value={certificateCount}    accent="#C9A227" />
        <StatTile icon={<ClipboardCheck size={17} />} label="Lessons Completed" value={completedLessons}   accent="#16A34A" />
      </div>

      {/* My Courses */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "#0A1535" }}>My Courses</h2>
          <Link href={lh("/learn")} style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#C9A227", textDecoration: "none", display: "flex", alignItems: "center", gap: 5, fontWeight: 600 }}>
            Browse all <ArrowRight size={13} />
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid rgba(10,21,53,0.08)", padding: "40px 32px", textAlign: "center", boxShadow: "0 1px 4px rgba(10,21,53,0.05)" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <BookOpen size={20} color="#C9A227" />
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.55)", marginBottom: 16 }}>
              You haven't enrolled in any courses yet.
            </p>
            <Link href={lh("/learn")} className="btn-primary" style={{ fontSize: 13, padding: "9px 22px" }}>Browse Courses</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
            {enrollments.map((e) => {
              const totalLessons = e.course.modules.flatMap((m) => m.lessons).length;
              const done         = e.lessonProgress.filter((p) => p.completed).length;
              const pct          = totalLessons > 0 ? Math.round((done / totalLessons) * 100) : 0;
              const isComplete   = pct === 100;

              return (
                <div
                  key={e.id}
                  style={{ background: "#ffffff", borderRadius: 14, border: "1px solid rgba(10,21,53,0.08)", padding: "20px 22px", boxShadow: "0 1px 4px rgba(10,21,53,0.05)", display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 10.5, fontWeight: 700, color: "#C9A227", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {e.course.category}
                      </span>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "#0A1535", marginTop: 4, lineHeight: 1.3 }}>{e.course.title}</h3>
                    </div>
                    {isComplete && (
                      <span style={{ flexShrink: 0, marginLeft: 10, display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.25)", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#16a34a", fontFamily: "var(--font-body)", whiteSpace: "nowrap" }}>
                        Complete
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div style={{ height: 5, background: "rgba(10,21,53,0.06)", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: isComplete ? "#16A34A" : "linear-gradient(90deg, #C9A227, #D4AF37)", borderRadius: 999, transition: "width 0.6s ease" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "rgba(10,21,53,0.4)" }}>{done} / {totalLessons} lessons</span>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "rgba(10,21,53,0.4)", fontWeight: 600 }}>{pct}%</span>
                    </div>
                  </div>

                  <Link
                    href={lh(`/dashboard/courses/${e.course.id}`)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", borderRadius: 8, background: "rgba(10,21,53,0.03)", border: "1px solid rgba(10,21,53,0.08)", textDecoration: "none", transition: "background 0.15s" }}
                    onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(201,162,39,0.06)")}
                    onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(10,21,53,0.03)")}
                  >
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "#0A1535", display: "flex", alignItems: "center", gap: 7 }}>
                      <PlayCircle size={14} color="#C9A227" /> {isComplete ? "Review Course" : "Continue Learning"}
                    </span>
                    <ChevronRight size={14} color="rgba(10,21,53,0.4)" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Certification status */}
      <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid rgba(10,21,53,0.08)", padding: "20px 24px", boxShadow: "0 1px 4px rgba(10,21,53,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "#0A1535", marginBottom: 6 }}>Certification Application</h3>
            {application ? (
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.55)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.25)", borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700, color: "#9a7810", marginRight: 8 }}>
                  {application.status.replace(/_/g, " ")}
                </span>
                {application.businessName}
              </p>
            ) : (
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.55)" }}>
                You haven't submitted a certification application yet.
              </p>
            )}
          </div>
          <Link
            href={lh("/dashboard/certification")}
            style={{ flexShrink: 0, marginLeft: 16, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "#C9A227", textDecoration: "none" }}
          >
            {application ? "View application" : "Start application"} <ChevronRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
