import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: { include: { modules: { include: { lessons: true } }, quiz: true } },
      lessonProgress: true,
    },
    orderBy: { enrolledAt: "desc" },
  });

  return NextResponse.json({ enrollments });
}

const enrollSchema = z.object({ courseId: z.string().min(1) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const body = await req.json().catch(() => null);
  const parsed = enrollSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { id: parsed.data.courseId } });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId: course.id } },
    update: {},
    create: { userId, courseId: course.id },
  });

  return NextResponse.json({ enrollment }, { status: 201 });
}
