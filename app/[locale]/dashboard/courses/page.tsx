import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import GlowingCard from "@/components/ui/GlowingCard";

export default async function DashboardCoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/auth/login`);
  const userId = (session.user as { id: string }).id;
  const lh = (href: string) => `/${locale}${href}`;

  const [courses, enrollments] = await Promise.all([
    prisma.course.findMany({
      where: { published: true },
      include: { modules: { include: { lessons: true } } },
      orderBy: { createdAt: "asc" },
    }).catch(() => []),
    prisma.enrollment.findMany({
      where: { userId },
      include: { lessonProgress: true },
    }).catch(() => []),
  ]);

  const enrollmentByCourse = new Map(enrollments.map((e) => [e.courseId, e]));

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, color: "#0A1535", marginBottom: 6 }}>
        Courses
      </h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.5)", marginBottom: 32 }}>
        Browse all available courses and pick up where you left off.
      </p>

      {courses.length === 0 ? (
        <GlowingCard style={{ padding: "32px", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.55)" }}>
            No courses are published yet. Check back soon.
          </p>
        </GlowingCard>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {courses.map((course) => {
            const totalLessons = course.modules.flatMap((m) => m.lessons).length;
            const enrollment = enrollmentByCourse.get(course.id);
            const completed = enrollment?.lessonProgress.filter((p) => p.completed).length ?? 0;
            const pct = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
            const isEnrolled = !!enrollment;
            const isComplete = totalLessons > 0 && completed >= totalLessons;

            return (
              <GlowingCard key={course.id} style={{ padding: "20px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#6D28D9", textTransform: "uppercase", letterSpacing: "0.06em" }}>{course.category}</div>
                  {isComplete && <CheckCircle2 size={16} color="#22C55E" />}
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "#0A1535", marginBottom: 8 }}>{course.title}</h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.55)", lineHeight: 1.6, marginBottom: 14 }}>{course.description}</p>

                <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.5)" }}>
                    <BookOpen size={13} /> {course.level}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.5)" }}>
                    <Clock size={13} /> {course.durationLabel}
                  </span>
                </div>

                {isEnrolled && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ height: 6, background: "rgba(109,40,217,0.1)", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }} />
                    </div>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.5)" }}>{completed}/{totalLessons} lessons · {pct}%</span>
                  </div>
                )}

                <Link href={lh(`/dashboard/courses/${course.id}`)} className={isEnrolled ? "btn-ghost" : "btn-primary"} style={{ fontSize: 13, padding: "9px 16px" }}>
                  {isEnrolled ? "Continue" : "Start Course"} <ArrowRight size={14} />
                </Link>
              </GlowingCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
