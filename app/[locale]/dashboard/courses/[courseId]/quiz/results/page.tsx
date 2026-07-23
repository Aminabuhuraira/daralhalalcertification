"use client";
import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Award, ArrowLeft } from "lucide-react";
import GlowingCard from "@/components/ui/GlowingCard";

type Breakdown = {
  questionId: string;
  text: string;
  options: string[];
  selected: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string | null;
};

type QuizResult = {
  score: number;
  passed: boolean;
  breakdown: Breakdown[];
  certificate: { serial: string } | null;
};

export default function QuizResultsPage() {
  return (
    <Suspense fallback={null}>
      <QuizResultsInner />
    </Suspense>
  );
}

function QuizResultsInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "en";
  const courseId = params?.courseId as string;
  const attemptId = searchParams.get("attemptId");
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (!attemptId) return;
    const raw = sessionStorage.getItem(`quiz-result-${attemptId}`);
    if (raw) setResult(JSON.parse(raw));
  }, [attemptId]);

  if (!result) {
    return (
      <GlowingCard style={{ padding: "32px", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.7)", marginBottom: 16 }}>
          We couldn't find that quiz result. It may have expired from your session.
        </p>
        <Link href={`/${locale}/dashboard/courses/${courseId}/quiz`} className="btn-primary">Retake Quiz</Link>
      </GlowingCard>
    );
  }

  return (
    <div>
      <GlowingCard style={{ padding: "32px 36px", marginBottom: 24, textAlign: "center" }}>
        <div className="icon-badge-lg" style={{ margin: "0 auto 16px" }}>
          {result.passed ? <Award size={28} color="var(--gold-300)" /> : <XCircle size={28} color="#f87171" />}
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, color: "#0A1535", marginBottom: 8 }}>
          {result.passed ? "You Passed!" : "Not Quite There"}
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "rgba(10,21,53,0.72)", marginBottom: 4 }}>
          Your score: <strong style={{ color: "#6D28D9" }}>{result.score}%</strong>
        </p>
        {result.passed && result.certificate && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.68)" }}>
            Certificate of Distinction issued — serial {result.certificate.serial}.{" "}
            <Link href={`/${locale}/dashboard/certificates`} style={{ color: "#6D28D9" }}>View certificates</Link>
          </p>
        )}
        {!result.passed && (
          <Link href={`/${locale}/dashboard/courses/${courseId}/quiz`} className="btn-primary" style={{ marginTop: 12, display: "inline-flex" }}>
            Retake Quiz
          </Link>
        )}
      </GlowingCard>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {result.breakdown.map((b, i) => (
          <GlowingCard key={b.questionId} style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              {b.isCorrect ? <CheckCircle2 size={18} color="#22C55E" /> : <XCircle size={18} color="#f87171" />}
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#0A1535", fontWeight: 600 }}>{i + 1}. {b.text}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginLeft: 28 }}>
              {b.options.map((opt, oi) => {
                const isSelected = oi === b.selected;
                const isCorrectAnswer = oi === b.correctIndex;
                return (
                  <div key={oi} style={{
                    fontFamily: "var(--font-body)", fontSize: 13, padding: "8px 12px", borderRadius: 6,
                    color: isCorrectAnswer ? "#16A34A" : isSelected ? "#DC2626" : "rgba(10,21,53,0.6)",
                    background: isCorrectAnswer ? "rgba(34,197,94,0.08)" : isSelected ? "rgba(248,113,113,0.08)" : "transparent",
                  }}>
                    {opt} {isCorrectAnswer && "✓"} {isSelected && !isCorrectAnswer && "✗"}
                  </div>
                );
              })}
            </div>
            {b.explanation && (
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.68)", marginTop: 10, marginLeft: 28 }}>
                {b.explanation}
              </p>
            )}
          </GlowingCard>
        ))}
      </div>

      <Link href={`/${locale}/dashboard/courses/${courseId}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 24, fontFamily: "var(--font-body)", fontSize: 13, color: "#6D28D9", textDecoration: "none" }}>
        <ArrowLeft size={14} /> Back to Course
      </Link>
    </div>
  );
}
