import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminQuizBuilder from "@/components/dashboard/AdminQuizBuilder";

export default async function AdminQuizBuilderPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { quiz: { include: { questions: { orderBy: { order: "asc" } } } } },
  }).catch(() => null);
  if (!course) notFound();

  const quiz = course.quiz
    ? {
        id: course.quiz.id,
        title: course.quiz.title,
        passScore: course.quiz.passScore,
        questions: course.quiz.questions.map((q) => ({
          id: q.id,
          order: q.order,
          text: q.text,
          options: JSON.parse(q.options) as string[],
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        })),
      }
    : null;

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, color: "#0A1535", marginBottom: 6 }}>
        Quiz Builder
      </h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.5)", marginBottom: 32 }}>
        {course.title}
      </p>
      <AdminQuizBuilder courseId={course.id} initialQuiz={quiz} />
    </div>
  );
}
