"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import GlowingCard from "@/components/ui/GlowingCard";

type Question = { id: string; order: number; text: string; options: string[] };

export default function QuizForm({
  quizId,
  courseId,
  title,
  questions,
}: {
  quizId: string;
  courseId: string;
  title: string;
  questions: Question[];
}) {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const allAnswered = answers.every((a) => a >= 0);

  const handleSubmit = async () => {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/quiz/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }
      sessionStorage.setItem(`quiz-result-${data.attempt.id}`, JSON.stringify(data));
      router.push(`/${locale}/dashboard/courses/${courseId}/quiz/results?attemptId=${data.attempt.id}`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400, color: "#0A1535", marginBottom: 8 }}>{title}</h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.68)", marginBottom: 28 }}>
        This quiz is optional. Score 70% or higher to earn a Certificate of Distinction.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {questions.map((q, qi) => (
          <GlowingCard key={q.id} style={{ padding: "22px 24px" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "#0A1535", marginBottom: 14, fontWeight: 600 }}>
              {qi + 1}. {q.text}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {q.options.map((opt, oi) => (
                <label
                  key={oi}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8,
                    cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13.5,
                    background: answers[qi] === oi ? "rgba(109,40,217,0.08)" : "rgba(109,40,217,0.02)",
                    border: answers[qi] === oi ? "1px solid rgba(109,40,217,0.3)" : "1px solid rgba(109,40,217,0.08)",
                    color: answers[qi] === oi ? "#6D28D9" : "rgba(10,21,53,0.7)",
                  }}
                >
                  <input
                    type="radio"
                    name={`q-${qi}`}
                    checked={answers[qi] === oi}
                    onChange={() => setAnswers((prev) => { const next = [...prev]; next[qi] = oi; return next; })}
                    style={{ accentColor: "#6D28D9" }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </GlowingCard>
        ))}
      </div>

      {error && <p style={{ color: "#f87171", fontSize: 13, fontFamily: "var(--font-body)", marginTop: 16 }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className="btn-primary"
        style={{ marginTop: 24, opacity: !allAnswered || submitting ? 0.6 : 1, cursor: !allAnswered || submitting ? "not-allowed" : "pointer" }}
      >
        {submitting ? "Submitting..." : "Submit Quiz"}
      </button>
    </div>
  );
}
