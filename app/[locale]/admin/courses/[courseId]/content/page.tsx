import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import AdminCourseContent from "@/components/dashboard/AdminCourseContent";

type Params = { params: Promise<{ locale: string; courseId: string }> };

export default async function AdminCourseContentPage({ params }: Params) {
  const { locale, courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  }).catch(() => null);

  if (!course) notFound();

  return (
    <div>
      <Link
        href={`/${locale}/admin/courses`}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(10,21,53,0.68)", textDecoration: "none", marginBottom: 20, fontFamily: "var(--font-body)" }}
      >
        <ArrowLeft size={14} /> Back to Courses
      </Link>

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400, color: "#0A1535", marginBottom: 4 }}>
        {course.title}
      </h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.68)", marginBottom: 32 }}>
        Manage modules, lessons, and video content for this course.
      </p>

      <AdminCourseContent course={course} />
    </div>
  );
}
