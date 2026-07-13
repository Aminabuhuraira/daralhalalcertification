import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ courseId: string; moduleId: string }> };

const createLessonSchema = z.object({
  title: z.string().min(1).max(160),
  contentMd: z.string().min(1),
  videoUrl: z.string().url().optional().nullable(),
  durationMin: z.number().int().min(0).optional(),
  order: z.number().int().min(0).optional(),
});

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { moduleId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = createLessonSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  let order = parsed.data.order;
  if (order === undefined) {
    const count = await prisma.lesson.count({ where: { moduleId } });
    order = count;
  }

  const lesson = await prisma.lesson.create({
    data: {
      moduleId,
      title: parsed.data.title,
      contentMd: parsed.data.contentMd,
      videoUrl: parsed.data.videoUrl ?? null,
      durationMin: parsed.data.durationMin ?? 0,
      order,
    },
  });
  return NextResponse.json({ lesson }, { status: 201 });
}
