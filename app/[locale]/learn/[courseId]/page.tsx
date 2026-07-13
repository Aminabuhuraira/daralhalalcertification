import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Clock, Users, ChevronDown, PlayCircle, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ locale: string; courseId: string }> };

const levelColor = (level: string) => {
  if (level === "Beginner") return { bg: "rgba(34,197,94,0.1)", text: "#16a34a", border: "rgba(34,197,94,0.25)" };
  if (level === "Intermediate") return { bg: "rgba(201,162,39,0.1)", text: "#9a7810", border: "rgba(201,162,39,0.25)" };
  return { bg: "rgba(10,21,53,0.06)", text: "#0A1535", border: "rgba(10,21,53,0.15)" };
};

export default async function PublicCoursePage({ params }: Params) {
  const { locale, courseId } = await params;

  const course = await prisma.course.findFirst({
    where: { OR: [{ id: courseId }, { slug: courseId }], published: true },
    include: {
      modules: {
        include: { lessons: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) notFound();

  const lc = levelColor(course.level);
  const totalLessons = course.modules.flatMap((m) => m.lessons).length;
  const lh = (href: string) => `/${locale}${href}`;

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section style={{ paddingTop: 120, paddingBottom: 80, background: "#0A1535", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 80% at 80% 50%, rgba(201,162,39,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div className="section-container" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ maxWidth: 700 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <span style={{ padding: "4px 12px", background: "rgba(201,162,39,0.12)", border: "1px solid rgba(201,162,39,0.3)", borderRadius: 4, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "#C9A227", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {course.category}
                </span>
                <span style={{ padding: "4px 12px", background: lc.bg, border: `1px solid ${lc.border}`, borderRadius: 4, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: lc.text }}>
                  {course.level}
                </span>
              </div>

              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px,4vw,52px)", fontWeight: 600, color: "#ffffff", lineHeight: 1.15, marginBottom: 20 }}>
                {course.title}
              </h1>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.75, marginBottom: 32, maxWidth: 560 }}>
                {course.description}
              </p>

              <div style={{ display: "flex", gap: 24, marginBottom: 36 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-body)", fontSize: 13.5, color: "rgba(255,255,255,0.55)" }}>
                  <Clock size={14} color="#C9A227" /> {course.durationLabel}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-body)", fontSize: 13.5, color: "rgba(255,255,255,0.55)" }}>
                  <BookOpen size={14} color="#C9A227" /> {totalLessons} lessons
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-body)", fontSize: 13.5, color: "rgba(255,255,255,0.55)" }}>
                  <Users size={14} color="#C9A227" /> {course._count.enrollments} enrolled
                </div>
              </div>

              <Link
                href={lh(`/dashboard/courses/${course.id}`)}
                className="btn-primary"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15, padding: "13px 28px" }}
              >
                Enroll Free <ArrowRight size={16} />
              </Link>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 12 }}>
                Free enrolment — sign in or create an account to start learning.
              </p>
            </div>
          </div>
        </section>

        {/* Course content outline */}
        <section style={{ padding: "72px 0", background: "#f8f7f4" }}>
          <div className="section-container" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 48, alignItems: "start" }}>

            {/* Curriculum */}
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, color: "#0A1535", marginBottom: 8 }}>
                Course Curriculum
              </h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.5)", marginBottom: 28 }}>
                {course.modules.length} module{course.modules.length !== 1 ? "s" : ""} · {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {course.modules.map((mod, mi) => (
                  <div key={mod.id} style={{ background: "#ffffff", borderRadius: 12, border: "1px solid rgba(10,21,53,0.08)", overflow: "hidden", boxShadow: "0 1px 4px rgba(10,21,53,0.04)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: mod.lessons.length > 0 ? "1px solid rgba(10,21,53,0.06)" : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 700, color: "#9a7810" }}>{mi + 1}</span>
                        </div>
                        <span style={{ fontFamily: "var(--font-display)", fontSize: 14.5, fontWeight: 600, color: "#0A1535" }}>{mod.title}</span>
                      </div>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.4)" }}>{mod.lessons.length} lessons</span>
                    </div>
                    {mod.lessons.map((lesson, li) => (
                      <div key={lesson.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: li < mod.lessons.length - 1 ? "1px solid rgba(10,21,53,0.04)" : "none", background: li % 2 === 0 ? "transparent" : "rgba(10,21,53,0.01)" }}>
                        {lesson.videoUrl ? (
                          <PlayCircle size={14} color="#C9A227" style={{ flexShrink: 0 }} />
                        ) : (
                          <FileText size={14} color="rgba(10,21,53,0.3)" style={{ flexShrink: 0 }} />
                        )}
                        <span style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "rgba(10,21,53,0.7)", flex: 1 }}>{lesson.title}</span>
                        {lesson.durationMin > 0 && (
                          <span style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "rgba(10,21,53,0.35)" }}>{lesson.durationMin} min</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Sticky enroll card */}
            <div style={{ position: "sticky", top: 24 }}>
              <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid rgba(10,21,53,0.08)", padding: "28px 24px", boxShadow: "0 4px 24px rgba(10,21,53,0.08)" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "#0A1535", marginBottom: 4 }}>Start Learning</h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.5)", marginBottom: 24 }}>Free access to all modules and lessons.</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  {[
                    `${totalLessons} lessons included`,
                    `Level: ${course.level}`,
                    `Duration: ${course.durationLabel}`,
                    "Certificate upon completion",
                    "Lifetime access",
                  ].map((feat) => (
                    <div key={feat} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <CheckCircle2 size={14} color="#16a34a" style={{ flexShrink: 0 }} />
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "rgba(10,21,53,0.7)" }}>{feat}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={lh(`/dashboard/courses/${course.id}`)}
                  className="btn-primary"
                  style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, fontSize: 14, padding: "13px 20px", width: "100%", boxSizing: "border-box" }}
                >
                  Enroll for Free <ArrowRight size={15} />
                </Link>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "rgba(10,21,53,0.35)", textAlign: "center", marginTop: 10 }}>
                  Account required — takes 30 seconds to register.
                </p>

                <div style={{ borderTop: "1px solid rgba(10,21,53,0.06)", marginTop: 20, paddingTop: 16, display: "flex", justifyContent: "center" }}>
                  <Link href={lh("/learn")} style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.4)", textDecoration: "none" }}>
                    ← Browse all courses
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What you'll learn */}
        <section style={{ padding: "64px 0", background: "#ffffff" }}>
          <div className="section-container" style={{ textAlign: "center" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, color: "#0A1535", marginBottom: 12 }}>
              Ready to get certified?
            </h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "rgba(10,21,53,0.55)", maxWidth: 480, margin: "0 auto 28px" }}>
              Join professionals who trust Dar Al-Halal Certification to validate their halal compliance knowledge.
            </p>
            <Link href={lh("/auth/register")} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, padding: "12px 28px" }}>
              Create Free Account <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
