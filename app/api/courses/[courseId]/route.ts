import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ courseId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { courseId } = await params;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } },
      quiz: { select: { id: true, title: true, passScore: true } },
    },
  });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ course });
}

const updateCourseSchema = z.object({
  title: z.string().min(2).max(160).optional(),
  description: z.string().min(2).optional(),
  category: z.string().min(1).max(80).optional(),
  level: z.string().min(1).max(40).optional(),
  durationLabel: z.string().min(1).max(40).optional(),
  published: z.boolean().optional(),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") return null;
  return session;
}

export async function PATCH(req: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { courseId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateCourseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }
  const course = await prisma.course.update({ where: { id: courseId }, data: parsed.data });
  return NextResponse.json({ course });
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { courseId } = await params;
  await prisma.course.delete({ where: { id: courseId } });
  return NextResponse.json({ ok: true });
}
