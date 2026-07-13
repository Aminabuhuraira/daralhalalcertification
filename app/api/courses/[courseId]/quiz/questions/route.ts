import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ courseId: string }> };

const createQuestionSchema = z.object({
  text: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).max(8),
  correctIndex: z.number().int().min(0),
  explanation: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { courseId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = createQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }
  if (parsed.data.correctIndex >= parsed.data.options.length) {
    return NextResponse.json({ error: "correctIndex out of range" }, { status: 400 });
  }

  const quiz = await prisma.quiz.findUnique({ where: { courseId } });
  if (!quiz) return NextResponse.json({ error: "Course has no quiz yet" }, { status: 404 });

  let order = parsed.data.order;
  if (order === undefined) {
    order = await prisma.question.count({ where: { quizId: quiz.id } });
  }

  const question = await prisma.question.create({
    data: {
      quizId: quiz.id,
      order,
      text: parsed.data.text,
      options: JSON.stringify(parsed.data.options),
      correctIndex: parsed.data.correctIndex,
      explanation: parsed.data.explanation,
    },
  });

  return NextResponse.json({ question }, { status: 201 });
}
