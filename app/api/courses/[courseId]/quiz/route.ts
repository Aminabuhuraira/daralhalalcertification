import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ courseId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";
  const { courseId } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { courseId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!quiz) return NextResponse.json({ quiz: null });

  const questions = quiz.questions.map((q) => ({
    id: q.id,
    order: q.order,
    text: q.text,
    options: JSON.parse(q.options) as string[],
    ...(isAdmin ? { correctIndex: q.correctIndex, explanation: q.explanation } : {}),
  }));

  return NextResponse.json({
    quiz: { id: quiz.id, title: quiz.title, passScore: quiz.passScore, questions },
  });
}

const createQuizSchema = z.object({
  title: z.string().min(1).max(160),
  passScore: z.number().int().min(1).max(100).optional(),
});

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { courseId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = createQuizSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }
  const quiz = await prisma.quiz.create({
    data: { courseId, title: parsed.data.title, passScore: parsed.data.passScore ?? 70 },
  });
  return NextResponse.json({ quiz }, { status: 201 });
}

const updateQuizSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  passScore: z.number().int().min(1).max(100).optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { courseId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateQuizSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }
  const quiz = await prisma.quiz.update({ where: { courseId }, data: parsed.data });
  return NextResponse.json({ quiz });
}
