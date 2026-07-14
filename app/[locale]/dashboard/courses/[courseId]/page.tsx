import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import CourseViewer from "@/components/dashboard/CourseViewer";

export default async function CourseTrainerPage({
  params,
}: {
  params: Promise<{ locale: string; courseId: string }>;
}) {
  const { locale, courseId } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/auth/login`);
  const userId = (session.user as { id: string }).id;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } },
      quiz: { select: { id: true } },
    },
  }).catch(() => null);
  if (!course) notFound();

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: {},
    create: { userId, courseId },
    include: { lessonProgress: true },
  }).catch(() => ({ lessonProgress: [] }));

  const completedLessonIds = enrollment.lessonProgress.filter((p) => p.completed).map((p) => p.lessonId);
  const totalLessons = course.modules.flatMap((m) => m.lessons).length;
  const allComplete = totalLessons > 0 && completedLessonIds.length >= totalLessons;

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400, color: "#0A1535", marginBottom: 24 }}>
        {course.title}
      </h1>
      <CourseViewer
        course={course}
        completedLessonIds={completedLessonIds}
        hasQuiz={!!course.quiz}
        allComplete={allComplete}
      />
    </div>
  );
}
