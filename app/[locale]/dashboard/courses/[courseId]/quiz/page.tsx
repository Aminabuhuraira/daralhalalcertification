import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import QuizForm from "@/components/dashboard/QuizForm";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ locale: string; courseId: string }>;
}) {
  const { locale, courseId } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/auth/login`);

  const quiz = await prisma.quiz.findUnique({
    where: { courseId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!quiz) notFound();

  const questions = quiz.questions.map((q) => ({
    id: q.id,
    order: q.order,
    text: q.text,
    options: JSON.parse(q.options) as string[],
  }));

  return <QuizForm quizId={quiz.id} courseId={courseId} title={quiz.title} questions={questions} />;
}
