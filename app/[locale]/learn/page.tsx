import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LearnCourseGrid from "@/components/sections/LearnCourseGrid";
import { prisma } from "@/lib/db";

export default async function LearnPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const courses = await prisma.course.findMany({
    where: { published: true },
    include: { _count: { select: { enrollments: true } } },
    orderBy: { createdAt: "asc" },
  });

  const gridCourses = courses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    level: c.level,
    durationLabel: c.durationLabel,
    enrollCount: c._count.enrollments,
  }));

  return (
    <>
      <Navbar />
      <main>
        <section className="section-hero-light dot-pattern" style={{ paddingTop: 140, paddingBottom: 100 }}>
          <div className="glow-orb glow-orb-purple" style={{ width: 420, height: 420, bottom: -80, right: -80, opacity: 0.14 }} />
          <div className="section-container" style={{ position: "relative", zIndex: 1 }}>
            <p className="text-overline" style={{ marginBottom: 20 }}>Knowledge Hub</p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,5vw,68px)", fontWeight: 300, color: "#4C1D95", marginBottom: 20, lineHeight: 1.1 }}>
              Master <span className="text-gold-shimmer">Halal Compliance</span>
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "rgba(10,21,53,0.6)", maxWidth: 520, lineHeight: 1.75 }}>
              Professional courses for business owners, compliance officers, and quality managers. Learn at your own pace.
            </p>
          </div>
        </section>

        <section style={{ padding: "80px 0", background: "var(--bg-light)" }}>
          <div className="section-container">
            {gridCourses.length === 0 ? (
              <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-muted)", textAlign: "center" }}>
                No courses are published yet. Check back soon.
              </p>
            ) : (
              <LearnCourseGrid courses={gridCourses} locale={locale} />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
