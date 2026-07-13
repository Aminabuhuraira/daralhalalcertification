import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { issueCertificateIfNeeded } from "@/lib/certificates";

type Params = { params: Promise<{ quizId: string }> };

const submitSchema = z.object({ answers: z.array(z.number().int().min(0)) });

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { quizId } = await params;

  const body = await req.json().catch(() => null);
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { orderBy: { order: "asc" } }, course: true },
  });
  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

  const { answers } = parsed.data;
  if (answers.length !== quiz.questions.length) {
    return NextResponse.json({ error: "Answer count does not match question count" }, { status: 400 });
  }

  let correctCount = 0;
  const breakdown = quiz.questions.map((question, i) => {
    const isCorrect = answers[i] === question.correctIndex;
    if (isCorrect) correctCount++;
    return {
      questionId: question.id,
      text: question.text,
      options: JSON.parse(question.options) as string[],
      selected: answers[i],
      correctIndex: question.correctIndex,
      isCorrect,
      explanation: question.explanation,
    };
  });

  const score = Math.round((correctCount / quiz.questions.length) * 100);
  const passed = score >= quiz.passScore;

  const attempt = await prisma.quizAttempt.create({
    data: { userId, quizId, score, passed, answers: JSON.stringify(answers) },
  });

  let certificate = null;
  if (passed) {
    certificate = await issueCertificateIfNeeded(userId, quiz.course.id, "DISTINCTION");
  }

  return NextResponse.json({ attempt, score, passed, breakdown, certificate });
}
