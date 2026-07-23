import { prisma } from "@/lib/db";
import AdminCourseList from "@/components/dashboard/AdminCourseList";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    include: { _count: { select: { enrollments: true, certificates: true } }, quiz: { select: { id: true } } },
    orderBy: { createdAt: "asc" },
  }).catch(() => []);

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, color: "#0A1535", marginBottom: 6 }}>
        Courses
      </h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.68)", marginBottom: 32 }}>
        Create courses in <strong>Settings → Create Course</strong>. Edit modules, lessons, and videos via the course content editor. Manage quizzes per course.
      </p>
      <AdminCourseList courses={courses.map((c) => ({ ...c, hasQuiz: !!c.quiz }))} />
    </div>
  );
}
