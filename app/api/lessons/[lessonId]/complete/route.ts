import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { issueCertificateIfNeeded } from "@/lib/certificates";

type Params = { params: Promise<{ lessonId: string }> };

export async function POST(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { lessonId } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: { include: { modules: { include: { lessons: true } } } } } } },
  });
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  const course = lesson.module.course;
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
  });
  if (!enrollment) {
    return NextResponse.json({ error: "You must enroll in this course first." }, { status: 400 });
  }

  await prisma.lessonProgress.upsert({
    where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
    update: { completed: true, completedAt: new Date() },
    create: { enrollmentId: enrollment.id, lessonId, completed: true, completedAt: new Date() },
  });

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const progress = await prisma.lessonProgress.findMany({
    where: { enrollmentId: enrollment.id, completed: true },
  });
  const allComplete = allLessons.length > 0 && progress.length >= allLessons.length;

  let certificate = null;
  if (allComplete) {
    if (!enrollment.completedAt) {
      await prisma.enrollment.update({ where: { id: enrollment.id }, data: { completedAt: new Date() } });
    }
    certificate = await issueCertificateIfNeeded(userId, course.id, "COMPLETION");
  }

  return NextResponse.json({ ok: true, allComplete, certificate });
}
