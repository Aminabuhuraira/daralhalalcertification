"use client";
import { useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ReactPlayer from "react-player";
import { CheckCircle2, Circle, Award, ClipboardList } from "lucide-react";
import GlowingCard from "@/components/ui/GlowingCard";

type Lesson = { id: string; title: string; order: number; contentMd: string; videoUrl: string | null; durationMin: number };
type ModuleT = { id: string; title: string; order: number; lessons: Lesson[] };
type CourseT = { id: string; title: string; modules: ModuleT[] };

export default function CourseViewer({
  course,
  completedLessonIds,
  hasQuiz,
  allComplete: initialAllComplete,
}: {
  course: CourseT;
  completedLessonIds: string[];
  hasQuiz: boolean;
  allComplete: boolean;
}) {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const allLessons = useMemo(() => course.modules.flatMap((m) => m.lessons), [course]);
  const [completed, setCompleted] = useState(new Set(completedLessonIds));
  const [activeId, setActiveId] = useState(allLessons[0]?.id);
  const [marking, setMarking] = useState(false);
  const [allComplete, setAllComplete] = useState(initialAllComplete);

  const activeLesson = allLessons.find((l) => l.id === activeId) || allLessons[0];

  const markComplete = async (lessonId: string) => {
    if (marking || completed.has(lessonId)) return;
    setMarking(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/complete`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setCompleted((prev) => new Set(prev).add(lessonId));
        if (data.allComplete) setAllComplete(true);
      }
    } finally {
      setMarking(false);
    }
  };

  const pct = allLessons.length > 0 ? Math.round((completed.size / allLessons.length) * 100) : 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 28 }}>
      {/* Sidebar: modules/lessons */}
      <div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ height: 6, background: "rgba(109,40,217,0.1)", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }} />
          </div>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.68)" }}>{pct}% complete</span>
        </div>
        {course.modules.map((m) => (
          <div key={m.id} style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#6D28D9", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{m.title}</div>
            {m.lessons.map((l) => {
              const isDone = completed.has(l.id);
              const isActive = l.id === activeLesson?.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setActiveId(l.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                    padding: "9px 10px", borderRadius: 8, marginBottom: 2, cursor: "pointer",
                    background: isActive ? "rgba(109,40,217,0.08)" : "transparent",
                    border: isActive ? "1px solid rgba(109,40,217,0.25)" : "1px solid transparent",
                    color: isActive ? "#6D28D9" : "rgba(10,21,53,0.65)",
                    fontFamily: "var(--font-body)", fontSize: 13,
                  }}
                >
                  {isDone ? <CheckCircle2 size={15} color="#22C55E" /> : <Circle size={15} color="rgba(10,21,53,0.3)" />}
                  <span style={{ flex: 1 }}>{l.title}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Content pane */}
      <div>
        {activeLesson && (
          <GlowingCard style={{ padding: "32px 36px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 500, color: "#0A1535", marginBottom: 20 }}>
              {activeLesson.title}
            </h2>

            {activeLesson.videoUrl && (
              <div style={{ marginBottom: 24, borderRadius: 12, overflow: "hidden" }}>
                <ReactPlayer src={activeLesson.videoUrl} controls width="100%" height={360} />
              </div>
            )}

            <div className="lesson-markdown" style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "rgba(10,21,53,0.82)", lineHeight: 1.8 }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeLesson.contentMd}</ReactMarkdown>
            </div>

            <div style={{ marginTop: 28, display: "flex", gap: 12 }}>
              <button
                onClick={() => markComplete(activeLesson.id)}
                disabled={completed.has(activeLesson.id) || marking}
                className="btn-primary"
                style={{ opacity: completed.has(activeLesson.id) ? 0.6 : 1, cursor: completed.has(activeLesson.id) ? "default" : "pointer" }}
              >
                {completed.has(activeLesson.id) ? <>Completed <CheckCircle2 size={15} /></> : "Mark Lesson Complete"}
              </button>
            </div>
          </GlowingCard>
        )}

        <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
          {hasQuiz && (
            <GlowingCard style={{ padding: "20px 22px", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <ClipboardList size={18} color="#6D28D9" />
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 500, color: "#0A1535" }}>Optional Quiz</h3>
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.68)", marginBottom: 14 }}>
                Pass with 70%+ to earn a Certificate of Distinction. Quizzes are entirely optional.
              </p>
              <button onClick={() => router.push(`/${locale}/dashboard/courses/${course.id}/quiz`)} className="btn-ghost" style={{ fontSize: 13 }}>
                Take the Quiz
              </button>
            </GlowingCard>
          )}
          {allComplete && (
            <GlowingCard style={{ padding: "20px 22px", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <Award size={18} color="#F5C842" />
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 500, color: "#0A1535" }}>Completion Certificate Earned</h3>
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.68)", marginBottom: 14 }}>
                You've completed every lesson in this course.
              </p>
              <Link href={`/${locale}/dashboard/certificates`} className="btn-ghost" style={{ fontSize: 13 }}>
                View My Certificates
              </Link>
            </GlowingCard>
          )}
        </div>
      </div>
    </div>
  );
}
