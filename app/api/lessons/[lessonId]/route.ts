import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ lessonId: string }> };

const updateLessonSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  contentMd: z.string().optional(),
  videoUrl: z.string().url().nullable().optional(),
  durationMin: z.number().int().min(0).optional(),
  order: z.number().int().min(0).optional(),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") return null;
  return session;
}

export async function PATCH(req: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { lessonId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateLessonSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }
  const lesson = await prisma.lesson.update({ where: { id: lessonId }, data: parsed.data });
  return NextResponse.json({ lesson });
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { lessonId } = await params;
  await prisma.lesson.delete({ where: { id: lessonId } });
  return NextResponse.json({ ok: true });
}
