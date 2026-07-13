"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ClipboardList, Video } from "lucide-react";
import GlowingCard from "@/components/ui/GlowingCard";

type Course = {
  id: string;
  title: string;
  category: string;
  level: string;
  published: boolean;
  hasQuiz: boolean;
  _count: { enrollments: number; certificates: number };
};

export default function AdminCourseList({ courses: initialCourses }: { courses: Course[] }) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const [courses, setCourses] = useState(initialCourses);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const togglePublished = async (course: Course) => {
    setUpdatingId(course.id);
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !course.published }),
      });
      if (res.ok) {
        setCourses((prev) => prev.map((c) => (c.id === course.id ? { ...c, published: !c.published } : c)));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {courses.map((course) => (
        <GlowingCard key={course.id} style={{ padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 500, color: "#0A1535", marginBottom: 4 }}>{course.title}</h3>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.5)" }}>
              {course.category} · {course.level} · {course._count.enrollments} enrolled · {course._count.certificates} certified
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href={`/${locale}/admin/courses/${course.id}/content`} className="btn-ghost" style={{ fontSize: 12.5, padding: "8px 16px" }}>
              <Video size={14} /> Manage Content
            </Link>
            <Link href={`/${locale}/admin/courses/${course.id}/quiz`} className="btn-ghost" style={{ fontSize: 12.5, padding: "8px 16px" }}>
              <ClipboardList size={14} /> {course.hasQuiz ? "Manage Quiz" : "Create Quiz"}
            </Link>
            <button
              onClick={() => togglePublished(course)}
              disabled={updatingId === course.id}
              className={course.published ? "btn-ghost" : "btn-primary"}
              style={{ fontSize: 12.5, padding: "8px 16px", opacity: updatingId === course.id ? 0.6 : 1 }}
            >
              {course.published ? "Unpublish" : "Publish"}
            </button>
          </div>
        </GlowingCard>
      ))}
    </div>
  );
}
